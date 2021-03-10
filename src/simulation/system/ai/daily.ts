import { Game } from '../../../context/game';
import { DailyTree } from '../behavior';

export const runDaily = (game: Game, day: number): Game => {
  Object.values(game.state.people.living).forEach((id) => {
    DailyTree(id);
  });
  console.log('resolving daily...', day, game.blackboard.processTime, game.blackboard.processLastTime);
  return game;
};
