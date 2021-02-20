import { GameEngineSystem } from 'react-game-engine';
import moment from 'moment';
import { GameEntities } from '../../../context/game';
import { YEAR } from '../../../util/const/time';

let lastDay = 0;
let running = false;

const runDaily = (entities: GameEntities) => new Promise<void>((resolve) => {
  const day = moment(entities.gameState.processTime).dayOfYear();
  if (day !== lastDay) {
    if (!running) {
      running = true;
      Object.values(entities.gameState.people).forEach((p) => {
        if (moment(p.birthday).dayOfYear() === day) {
          if (entities.gameState.fastForward < YEAR) { entities.gameDispatch({type: 'personBirthday', person: p}); }
        }
      });
      running = false;
      console.log('resolving daily...');
    } else {
      console.log('daily still running');
    }
  }
  lastDay = day;
  resolve();
});

const DailyAI: GameEngineSystem = (entities) => {
  runDaily(entities); // just let it go
  return entities;
};

export default DailyAI;
