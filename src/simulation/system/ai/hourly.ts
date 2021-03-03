import { Game } from '../../../context/game';
import { HourlyTree } from '../behavior';

export const runHourly = (game: Game): Game => {
  Object.values(game.state.people.living).forEach(id => {
    HourlyTree(game.state.people.all[id], game);
  });
  console.log('resolving hourly...');
  return game;
};
