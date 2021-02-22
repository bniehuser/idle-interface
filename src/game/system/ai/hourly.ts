import { Game } from '../../../context/game';
import { HourlyTree } from './behavior/tree';

export const runHourly = (game: Game): Game => {
  Object.values(game.state.living).forEach(id => {
    HourlyTree(game.state.people[id], game);
  });
  console.log('resolving hourly...');
  return game;
};
