import { GameEngineSystem } from 'react-game-engine';

export const TIME_WARP = 10;

const GameTime: GameEngineSystem = (entities, {time}) => {
  entities.gameDispatch({type: 'addClock', delta: time.delta * TIME_WARP});
  return entities;
};

export default GameTime;
