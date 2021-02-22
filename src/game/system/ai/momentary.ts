import { Game } from '../../../context/game';
import { MomentaryTree } from './behavior/tree';

export const runMomentary = (game: Game): Game => {
  game.dispatch({type: 'setClock', now: game.blackboard.now});
  Object.values(game.state.living).forEach(id => {
    MomentaryTree(game.state.people[id], game);
  });
  return game;
};
