import moment from 'moment';
import { Game } from '../../../context/game';
import { YEAR } from '../../../util/const/time';

export const runDaily = (game: Game, day: number): Game => {
  Object.values(game.state.people).forEach((p) => {
	if (moment(p.birthday).dayOfYear() === day) {
	  if (game.state.fastForward < YEAR) { game.dispatch({type: 'personBirthday', person: p}); }
	}
  });
  console.log('resolving daily...', day);
  return game;
};
