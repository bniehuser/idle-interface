import React, { createContext, useReducer } from 'react';
import { Person, processBirthday } from '../game/entity/person';
import { EmojiKey, htmlEmoji } from '../util/emoji';
import Val from '../components/game/interface/Val';

export type GameAction =
  { type: 'addClock', delta: number }
  | { type: 'addPlayer', player: Person }
  | { type: 'removePlayer', player: Person }
  | { type: 'updatePerson', person: Partial<Person> }
  | { type: 'notify', content: React.ReactNode, key?: EmojiKey }
  | { type: 'personBirthday', person: Person }
  | { type: 'setPeople', payload: Person[] };

type People = {[id: number]: Person};

export interface GameNotification {
  type?: EmojiKey;
  content: React.ReactNode;
  at: Date;
}

export interface GameState {
  gameTime: Date;
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

type GameProviderProps = { children: React.ReactNode };

const GameStateContext = createContext<GameState | undefined>(undefined);
const GameDispatchContext = createContext<React.Dispatch<GameAction> | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'addClock':
      // not immutable, just set it.
      state.gameTime.setTime(state.gameTime.getTime() + action.delta);
      return state;
    case 'setPeople':
      // not immutable, just set it.
      state.people = action.payload.reduce((a, c) => { a[c.id] = c; return a; }, {} as People);
      return state;
    case 'updatePerson':
      // not immutable, just set it.
      if (action.person.id) {
        state.people[action.person.id] = Object.assign(state.people[action.person.id] || {}, action.person);
      }
      return state;
    case 'notify':
      return {
        ...state,
        notifications: [
          {type: action.key, content: action.content, at: new Date(state.gameTime)} as GameNotification,
          ...state.notifications,
        ].slice(0, 100),
      };
    case 'personBirthday':
      // not immutable, just set it.
      const p = action.person;
      const updates = processBirthday(p, state.gameTime);
      const newP = Object.assign(p, updates);
      const notice = <>Happy <Val val={newP.age}/>, {newP.avatar}{newP.name.given} {newP.name.family}!</>;
      console.log(htmlEmoji('birthday') + notice, state.gameTime);
      return {
        ...state,
        people: { ...state.people, [p.id]: newP },
        notifications: [
          {type: 'birthday', content: notice, at: new Date(state.gameTime)} as GameNotification,
          ...state.notifications,
        ].slice(0, 100),
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

function GameProvider({children}: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, {gameTime: new Date('3600-06-01 00:00:00'), people: [], notifications: []});
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
