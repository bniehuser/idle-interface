import { GameEngineSystem } from 'react-game-engine';
import { gameStartTime } from '../../context/game';

export const TIME_WARP = 1000;

const GameTime: GameEngineSystem = (entities) => {
  const now = gameStartTime + ((Date.now() - entities.gameState.realStart) * TIME_WARP);
  entities.gameDispatch({type: 'setClock', now});
  return entities;
};

export default GameTime;
