import React, { createContext, useReducer } from 'react';

type GameAction =
  { type: 'addClock', delta: number }
  | { type: 'addPlayer', player: Person }
  | { type: 'removePlayer', player: Person };
type Dispatch = (action: GameAction) => void;

interface Person {
  name?: string;
}

interface GameState {
  gameTime: Date;
  people?: Person[];
}

type GameProviderProps = { children: React.ReactNode };

const GameStateContext = createContext<GameState | undefined>(undefined);
const GameDispatchContext = createContext<Dispatch | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'addClock':
      // not immutable, just set it.
      state.gameTime.setTime(state.gameTime.getTime() + action.delta);
      return state;
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

function GameProvider({children}: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, {gameTime: new Date('3600-06-01T00:00:00Z')});
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

function useGameDispatch() {
  const context = React.useContext(GameDispatchContext);
  if (context === undefined) {
    throw new Error('useGameDispatch must be used within a GameProvider');
  }
  return context;
}

function useGame() {
  return [useGameState(), useGameDispatch()];
}

export { GameProvider, useGameState, useGameDispatch, useGame };
