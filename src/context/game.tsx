import React, { createContext, useReducer } from 'react';
import { Map } from '../simulation/entity/map';
import { createRandomPerson, PersonStore, Person, processBirthday } from '../simulation/entity/person';
import { Relationship, RelationshipStore } from '../simulation/entity/relationship';
import LZipper from '../util/data/LZipper';
import { EmojiKey } from '../util/emoji';
import { bytesToSize } from '../util/lang-format';
import { SimulationState } from '../simulation/state';

export type GameAction =
  { type: 'addClock', delta: number }
  | { type: 'setClock', now: number }
  | { type: 'fastForward', speed: number }
  | { type: 'setMap', map: Map }
  | { type: 'addRandomPerson' }
  | { type: 'addRandomPeople', num: number }
  | { type: 'removePerson', personId: number }
  | { type: 'updatePerson', person: Partial<Person> }
  | { type: 'killPerson', personId: number, reason: string }
  | { type: 'notify', content: GameEvent | string, key?: EmojiKey, at?: number }
  | { type: 'personBirthday', person: Person }
  | { type: 'setPeople', payload: Person[] }
  | { type: 'saveGame' }
  | { type: 'loadGame' }
  | { type: 'console', mode?: 'error'|'log', data: any }
  | { type: '_test', data: { [k: string]: string | number } };

type People = { [id: number]: Person };

export interface GameEvent {
  type: string;
  person?: number;
  val?: string | number;
}

export interface GameNotification {
  type?: EmojiKey;
  content: GameEvent | string;
  at: number;
}

export interface GameState {
  _test?: {
    [k: string]: string | number,
  };
  realStart: number;
  gameTime: number;
  fastForward: number;
  personId: number;
  placeId: number;
  people: PersonStore;
  relationships: RelationshipStore;
  map?: Map;
  notifications: GameNotification[];
  DEBUG: boolean;
}

export type GameDispatch = React.Dispatch<GameAction>;

export type GameBlackboard = {
  [k: string]: any,
};

// for use with react-simulation-engine
export type Game = {
  state: GameState,
  dispatch: GameDispatch,
  blackboard: GameBlackboard,
  [k: string]: any,
};

export const gameStartTime = new Date('3600-06-01 00:00:00').getTime();

export const createGameState = (): GameState => {
  return {
    realStart: Date.now(),
    gameTime: gameStartTime,
    fastForward: 0,
    personId: 0,
    placeId: 0,
    people: {id: 0, all: {}, living: [], dead: []},
    relationships: {id: 0, all: {}, active: [], volatile: []},
    notifications: [],
    DEBUG: false,
  };
};

type GameProviderProps = { children: React.ReactNode };

const GameStateContext = createContext<GameState | undefined>(undefined);
const GameDispatchContext = createContext<React.Dispatch<GameAction> | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  let personId: number;
  switch (action.type) {
    case 'setClock':
      return {...state, gameTime: action.now};
    case 'fastForward':
      return {...state, fastForward: action.speed};
    case 'setPeople':
      const peopleIds: number[] = [];
      const people = action.payload.reduce((a, c) => {
        a[c.id] = c;
        peopleIds.push(c.id);
        return a;
      }, {} as People);
      return {...state, people: {id: state.people.id, all: people, living: peopleIds, dead: []}};
    case 'addRandomPeople':
      personId = state.people.id;
      const newPeople: {[k: number]: Person} = {};
      let relationshipId = state.relationships.id;
      const newRelationships: Relationship[] = [];
      for (let i = 0; i < action.num; i++) {
        personId++;
        const p = createRandomPerson({simulationTime: state.gameTime, map: state.map} as SimulationState);
        p.id = ++personId;
        newPeople[personId] = p;
        // newRelationships.push(...createParentChildRelationships(state.people.all[parent1], p).map(r => ({...r, id: ++relationshipId})));
        // newRelationships.push(...createParentChildRelationships(state.people.all[parent2], p).map(r => ({...r, id: ++relationshipId})));
      }
      return {
        ...applyNotification(state, `Added ${action.num} people to game.`),
        people: {
          ...state.people,
          id: personId,
          all: {...state.people.all, ...newPeople},
          living: [...state.people.living, ...Object.keys(newPeople).map(k => parseInt(k, 10))],
        },
        relationships: {
          ...state.relationships,
          id: relationshipId,
          all: {...state.relationships.all, ...(newRelationships.reduce((a, c) => {a[c.id] = c; return a; }, {} as {[k: number]: Relationship}))},
        },
      };
    case 'addRandomPerson':
      personId = state.personId;
      const ap = createRandomPerson({simulationTime: state.gameTime, map: state.map} as SimulationState);
      ap.id = ++personId;
      return {
        ...state,
        people: {
          ...state.people,
          all: {...state.people.all, [ap.id]: ap},
          living: [...state.people.living, personId],
        },
      };
    case 'updatePerson':
      if (!action.person.id) {
        return state;
      }
      const person = Object.assign(state.people.all[action.person.id] || {}, action.person);
      return {...state, people: { ...state.people, all: {...state.people.all, [action.person.id]: person}}};
    case 'killPerson':
      const dead = state.people.all[action.personId];
      return applyNotification({
        ...state,
        people: {
          ...state.people,
          living: state.people.living.filter(id => id !== action.personId),
          dead: [...state.people.dead, action.personId],
        },
      }, `P{${dead.id}} ${action.reason}`, undefined, 'coffin');
    case 'setMap':
      return {...state, map: action.map};
    case 'notify':
      return applyNotification(state, action.content, action.at, action.key);
    case 'personBirthday':
      // not immutable, just set it.
      const p = action.person;
      const updates = processBirthday(p, BLACKBOARD.processTime);
      const newP = Object.assign(p, updates);
      const notice = {type: 'birthday', person: newP.id, val: newP.age}; // <>Happy <Val val={newP.age}/>, {newP.avatar}{newP.name.given} {newP.name.family}!</>;
      return {
        ...applyNotification(state, notice, BLACKBOARD.processTime, 'birthday'),
        people: { ...state.people, all: {...state.people.all, [p.id]: newP}},
      };
    case 'saveGame':
      const compressed = LZipper.compress(JSON.stringify(state));
// 	  const compressed = LZipper.compress(CJSON.stringify(state));
      localStorage.setItem('gameState', compressed);
      return applyNotification(state, `Game Saved (${bytesToSize(compressed.length)})`);
    case 'loadGame':
      const saved = localStorage.getItem('gameState');
      if (saved) {
        const savedState = JSON.parse(LZipper.decompress(saved));
// 	    const savedState = CJSON.parse(LZipper.decompress(saved));
        clearBlackboard();
        BLACKBOARD.processLastTime = savedState.gameTime;
        BLACKBOARD.processTime = savedState.gameTime;
        BLACKBOARD.catchUpFrom = savedState.gameTime;
        return savedState;
      }
      return state;
    case 'console':
      console[action.mode || 'log'](...(!Array.isArray(action.data) ? [action.data] : action.data));
      return state;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export const applyNotification = (state: GameState, content: string | GameEvent, at?: number, key?: EmojiKey) =>
  ({
    ...state,
    notifications: [{
      content,
      type: key || 'gear',
      at: at || BLACKBOARD.processTime,
    }, ...state.notifications].slice(0, 100),
  });

function GameProvider({children}: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, createGameState());
  STATE_REF.state = state;
  return (
    <GameStateContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameStateContext.Provider>
  );
}

function useGameState() {
  const context = React.useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
}

function useGameDispatch(): GameDispatch {
  const context = React.useContext(GameDispatchContext);
  if (context === undefined) {
    throw new Error('useGameDispatch must be used within a GameProvider');
  }
  return context;
}

const BLACKBOARD: GameBlackboard = {
  processTime: gameStartTime,
  _anchor: {very: 'heavy'},
  people: {},
};

export type GameStateRef = { state: GameState };
const STATE_REF: GameStateRef = {
  state: createGameState(),
};

function useGameBlackboard(): GameBlackboard {
  return BLACKBOARD;
}

export function useGameStateRef(): GameStateRef {
  return STATE_REF;
}

export const clearBlackboard = () => {
  Object.keys(BLACKBOARD).forEach(k => k === '_anchor' ? null : delete BLACKBOARD[k]);
  BLACKBOARD.people = {};
};

function useGame(): [GameState, GameDispatch, GameBlackboard] {
  return [useGameState(), useGameDispatch(), useGameBlackboard()];
}

export { GameProvider, useGameState, useGameDispatch, useGameBlackboard, useGame };
