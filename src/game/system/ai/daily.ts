import moment from 'moment';
import { Game } from '../../../context/game';
import { YEAR } from '../../../util/const/time';

export const runDaily = (game: Game, day: number): Game => {
  Object.values(game.state.living).forEach((id) => {
    const p = game.state.people[id];
    if (moment(p.birthday).dayOfYear() === day) {
      if (game.state.fastForward < YEAR) {
        game.dispatch({type: 'personBirthday', person: p});
      }
    }
  });
  console.log('resolving daily...', day, game.blackboard.processTime, game.blackboard.processLastTime);
  return game;
};
