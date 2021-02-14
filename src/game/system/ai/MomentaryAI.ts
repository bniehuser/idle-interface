import { GameEngineSystem } from 'react-game-engine';
import moment from 'moment';

let lastMinute = 0;
let running = false;

const runMomentary = (entities: any) => new Promise((resolve) => {
  const minute = moment(entities.gameState.gameTime).minute();
  if (minute !== lastMinute) {
    if (!running) {
      running = true;
      // for (let i = 0; i < 10000; i++) {
      //   const someVal = { value: Math.random() * Math.random() * Math.random() };
      //   delete someVal.value;
      // }
      running = false;
    } else {
      console.log('momentary still running');
    }
  }
  lastMinute = minute;
  resolve();
});

const MomentaryAI: GameEngineSystem = (entities) => {
  runMomentary(entities); // just let it go
  return entities;
};

export default MomentaryAI;
