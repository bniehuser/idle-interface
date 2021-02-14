import { GameEngineSystem } from 'react-game-engine';
import moment from 'moment';

let lastHour = 0;
let running = false;

const runHourly = (entities: any) => new Promise((resolve) => {
  const hour = moment(entities.gameState.gameTime).hour();
  if (hour !== lastHour) {
    if (!running) {
      running = true;
      // for (let i = 0; i < 10000; i++) {
      //   const someVal = { value: Math.random() * Math.random() * Math.random() };
      //   delete someVal.value;
      // }
      running = false;
      console.log('resolving hourly...');
    } else {
      console.log('hourly still running');
    }
  }
  lastHour = hour;
  resolve();
});

const HourlyAI: GameEngineSystem = (entities) => {
  runHourly(entities); // just let it go
  return entities;
};

export default HourlyAI;
