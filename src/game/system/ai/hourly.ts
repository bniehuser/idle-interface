import { Game } from '../../../context/game';
import { DAY } from '../../../util/const/time';
import { MainTree } from './behavior/tree';

export const runHourly = (game: Game): Game => {
  Object.values(game.state.living).forEach(id => {
    const p = game.state.people[id];
    MainTree(p, game);
    if (game.state.fastForward < DAY) {
      if (Math.random() > .9996) {
        game.dispatch({
          type: 'notify',
          at: game.blackboard.processTime,
          key: 'speech',
          content: `${p.avatar}${p.name.given} ${p.name.family} says 'hey!'`,
        });
      }
      if (Math.random() > .9999) {
        game.dispatch({
          type: 'notify',
          at: game.blackboard.processTime,
          key: 'thought',
          content: `${p.avatar}${p.name.given} ${p.name.family} is daydreaming...`,
        });
      }
      if (Math.random() > .9999) {
        game.dispatch({
          type: 'notify',
          at: game.blackboard.processTime,
          key: 'yell',
          content: `${p.avatar}${p.name.given} ${p.name.family} is VERY ANGRY...`,
        });
      }
    }
  });
  console.log('resolving hourly...');
  return game;
};
