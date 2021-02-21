import { Game } from '../../../context/game';
import { DAY } from '../../../util/const/time';

export const runHourly = (game: Game): Game => {
  Object.values(game.state.people).forEach(p => {
	if (Math.random() > .9996) {
	  if (game.state.fastForward < DAY) { game.dispatch({type: 'notify', at: game.blackboard.processTime, key: 'speech', content: `${p.avatar}${p.name.given} ${p.name.family} says 'hey!'`}); }
	}
	if (Math.random() > .9999) {
	  if (game.state.fastForward < DAY) { game.dispatch({type: 'notify', at: game.blackboard.processTime, key: 'thought', content: `${p.avatar}${p.name.given} ${p.name.family} is daydreaming...`}); }
	}
	if (Math.random() > .9999) {
	  if (game.state.fastForward < DAY) { game.dispatch({type: 'notify', at: game.blackboard.processTime, key: 'yell', content: `${p.avatar}${p.name.given} ${p.name.family} is VERY ANGRY...`}); }
	}
  });
  console.log('resolving hourly...');
  return game;
};
