import { GameEngineSystem } from 'react-game-engine';
import { Game, gameStartTime } from '../../context/game';

export const TIME_WARP = 1000;

const GameTime: GameEngineSystem = (game: Game) => {
  game.blackboard.now = gameStartTime + ((Date.now() - game.state.realStart) * TIME_WARP);
  return game;
};

export default GameTime;
