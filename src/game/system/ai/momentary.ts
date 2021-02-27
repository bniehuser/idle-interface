import { Game } from '../../../context/game';
import { MomentaryTree } from './behavior';

export const runMomentary = (game: Game): Game => {
  game.dispatch({type: 'setClock', now: game.blackboard.now});
  Object.values(game.state.people.living).forEach(id => {
    MomentaryTree(game.state.people.all[id], game);
  });
  return game;
};
