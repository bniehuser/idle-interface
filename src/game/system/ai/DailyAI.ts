import { GameEngineSystem } from 'react-game-engine';
import moment from 'moment';
import { GameEntities } from '../../../context/game';

let lastDay = 0;
let running = false;

const runDaily = (entities: GameEntities) => new Promise((resolve) => {
  const day = moment(entities.gameState.gameTime).dayOfYear();
  if (day !== lastDay) {
    if (!running) {
      running = true;
      Object.values(entities.gameState.people).forEach((p) => {
        if (moment(p.birthday).dayOfYear() === day) {
          entities.gameDispatch({type: 'personBirthday', person: p});
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
