import { Game } from '../../../context/game';
import { HOUR } from '../../../util/const/time';

export const runMomentary = (game: Game): Game => {
  game.dispatch({type: 'setClock', now: game.blackboard.now});
  Object.values(game.state.living).forEach(id => {
    const p = game.state.people[id];
    if (Math.random() > .999996) {
      if (game.state.fastForward < HOUR) {
        game.dispatch({
          type: 'notify',
          at: game.blackboard.processTime,
          key: 'money',
          content: `${p.avatar}${p.name.given} ${p.name.family} found $100 on the ground!`,
        });
      }
    }
  });
  return game;
};
