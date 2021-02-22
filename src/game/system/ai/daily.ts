import { Game } from '../../../context/game';
import { DailyTree } from './behavior';

export const runDaily = (game: Game, day: number): Game => {
  Object.values(game.state.living).forEach((id) => {
    DailyTree(game.state.people[id], game);
  });
  console.log('resolving daily...', day, game.blackboard.processTime, game.blackboard.processLastTime);
  return game;
};
