import React, { createContext, useReducer } from 'react';
import { createPerson, Person, processBirthday } from '../game/entity/person';
import { EmojiKey } from '../util/emoji';
import LZipper from '../util/data/LZipper';
import { bytesToSize } from '../util/lang-format';

export type GameAction =
  { type: 'addClock', delta: number }
  | { type: 'setClock', now: number }
  | { type: 'fastForward', speed: number }
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
  people: People;
  living: number[];
  dead: number[];
  notifications: GameNotification[];
}

export type GameDispatch = React.Dispatch<GameAction>;

export type GameBlackboard = {
  [k: string]: any,
};

// for use with react-game-engine
export type Game = {
  state: GameState,
  dispatch: GameDispatch,
  blackboard: GameBlackboard,
  [k: string]: any,
};

export const gameStartTime = new Date('3600-06-01 00:00:00').getTime();

const createGameState = (): GameState => {
  return {
    realStart: Date.now(),
    gameTime: gameStartTime,
    fastForward: 0,
    personId: 0,
    placeId: 0,
    people: [],
    living: [],
    dead: [],
    notifications: [],
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
      return {...state, people, living: peopleIds, dead: []};
    case 'addRandomPeople':
      personId = state.personId;
      const newPeopleIds: number[] = [];
      const newPeople: People = {};
      for (let i = 0; i < action.num; i++) {
        personId++;
        newPeople[personId] = createPerson(state.gameTime, personId);
        newPeopleIds.push(personId);
      }
      return {
        ...applyNotification(state, `Added ${action.num} people to game.`),
        personId,
        people: Object.assign(state.people, newPeople),
        living: [...state.living, ...newPeopleIds],
      };
    case 'addRandomPerson':
      personId = state.personId;
      personId++;
      return {
        ...state,
        personId,
        people: {...state.people, [personId]: createPerson(state.gameTime, personId)},
        living: [...state.living, personId],
      };
    case 'updatePerson':
      if (!action.person.id) {
        return state;
      }
      const person = Object.assign(state.people[action.person.id] || {}, action.person);
      return {...state, people: {...state.people, [action.person.id]: person}};
    case 'killPerson':
      const dead = state.people[action.personId];
      return applyNotification({
        ...state,
        living: state.living.filter(id => id !== action.personId),
        dead: [...state.dead, action.personId],
      }, `${dead.avatar}${dead.name.given} ${dead.name.family} ${action.reason}`, undefined, 'coffin');
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
        people: {...state.people, [p.id]: newP},
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
  _anchor: {very: 'heavy'},
  people: {},
};

function useGameBlackboard(): GameBlackboard {
  return BLACKBOARD;
}

export const clearBlackboard = () => {
  Object.keys(BLACKBOARD).forEach(k => k === '_anchor' ? null : delete BLACKBOARD[k]);
  BLACKBOARD.people = {};
};

function useGame(): [GameState, GameDispatch, GameBlackboard] {
  return [useGameState(), useGameDispatch(), useGameBlackboard()];
}

export { GameProvider, useGameState, useGameDispatch, useGameBlackboard, useGame };
