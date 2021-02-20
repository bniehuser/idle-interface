import React, { createContext, useReducer } from 'react';
import { createPerson, Person, processBirthday } from '../game/entity/person';
import { EmojiKey } from '../util/emoji';
import LZipper from '../util/data/LZipper';
import CJSON from '../util/data/CJSON';
import { bytesToSize } from '../util/lang-format';

export type GameAction =
  { type: 'addClock', delta: number }
  | { type: 'setClock', now: number }
  | { type: 'fastForward', speed: number, processTime: number }
  | { type: 'addRandomPerson' }
  | { type: 'addRandomPeople', num: number }
  | { type: 'removePerson', personId: number }
  | { type: 'updatePerson', person: Partial<Person> }
  | { type: 'notify', content: GameEvent|string, key?: EmojiKey }
  | { type: 'personBirthday', person: Person }
  | { type: 'setPeople', payload: Person[] }
  | { type: 'saveGame' }
  | { type: 'loadGame' };

type People = {[id: number]: Person};

export interface GameEvent {
  type: string;
  person?: number;
  val?: string|number;
}

export interface GameNotification {
  type?: EmojiKey;
  content: GameEvent|string;
  at: number;
}

export interface GameState {
  realStart: number;
  gameTime: number;
  gameLastTime: number;
  processTime: number;
  fastForward: number;
  personId: number;
  placeId: number;
  people: People;
  notifications: GameNotification[];
}
export type GameDispatch = React.Dispatch<GameAction>;

// for use with react-game-engine
export type GameEntities = {
  gameState: GameState,
  gameDispatch: GameDispatch,
  [k: string]: any,
};

export const gameStartTime = new Date('3600-06-01 00:00:00').getTime();

const createGameState = (): GameState => {
  return {
    realStart: Date.now(),
    gameTime: gameStartTime,
    gameLastTime: gameStartTime,
    processTime:  gameStartTime,
    fastForward: 0,
    personId: 0,
    placeId: 0,
    people: [],
    notifications: [],
  };
};

type GameProviderProps = { children: React.ReactNode };

const GameStateContext = createContext<GameState | undefined>(undefined);
const GameDispatchContext = createContext<React.Dispatch<GameAction> | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  let personId: number;
  switch (action.type) {
    case 'addClock':
      // not immutable, just set it.
      return { ...state, gameLastTime: state.processTime, gameTime: state.gameTime + action.delta };
    case 'setClock':
      // not immutable, just set it.
      return { ...state, gameLastTime: state.gameTime, gameTime: action.now };
    case 'fastForward':
      return { ...state, fastForward: action.speed, processTime: action.processTime };
    case 'setPeople':
      // not immutable, just set it.
      const people = action.payload.reduce((a, c) => { a[c.id] = c; return a; }, {} as People);
      return {...state, people };
    case 'addRandomPeople':
      personId = state.personId;
      const newPeople: People = {};
      for (let i = 0; i < action.num; i++) {
        personId++;
        newPeople[personId] = createPerson(state.gameTime, personId);
      }
      return { ...applyNotification(state, `Added ${action.num} people to game.`), personId, people: Object.assign(state.people, newPeople) };
    case 'addRandomPerson':
      personId = state.personId;
      personId++;
      return {...state, personId, people: {...state.people, [personId]: createPerson(state.gameTime, personId)}};
    case 'updatePerson':
      if (!action.person.id) { return state; }
      const person = Object.assign(state.people[action.person.id] || {}, action.person);
      return {...state, people: {...state.people, [action.person.id]: person }};
    case 'notify':
      return applyNotification(state, action.content, action.key);
    case 'personBirthday':
      // not immutable, just set it.
      const p = action.person;
      const updates = processBirthday(p, state.gameTime);
      const newP = Object.assign(p, updates);
      const notice = {type: 'birthday', person: newP.id, val: newP.age}; // <>Happy <Val val={newP.age}/>, {newP.avatar}{newP.name.given} {newP.name.family}!</>;
      return {
        ...applyNotification(state, notice, 'birthday'),
        people: { ...state.people, [p.id]: newP },
      };
    case 'saveGame':
      const compressed = LZipper.compress(CJSON.stringify(state));
      localStorage.setItem('gameState', compressed);
      return applyNotification(state, `Game Saved (${bytesToSize(compressed.length)})`);
    case 'loadGame':
      const saved = localStorage.getItem('gameState');
      if (saved) {
        return CJSON.parse(LZipper.decompress(saved));
      }
      return state;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export const applyNotification = (state: GameState, content: string|GameEvent, key?: EmojiKey) =>
  ({...state, notifications: [{content, type: key || 'gear', at: state.gameTime}, ...state.notifications].slice(0, 100)});

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

function useGame(): [GameState, GameDispatch] {
  return [useGameState(), useGameDispatch()];
}

export { GameProvider, useGameState, useGameDispatch, useGame };
