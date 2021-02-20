import { GameEngineSystem } from 'react-game-engine';
import moment from 'moment';
import { GameEntities } from '../../../context/game';
import { HOUR } from '../../../util/const/time';

let lastMinute = 0;
let running = false;

const runMomentary = (entities: GameEntities) => new Promise<void>((resolve) => {
  const minute = moment(entities.gameState.processTime).minute();
  if (minute !== lastMinute) {
    if (!running) {
      running = true;
      // for (let i = 0; i < 10000; i++) {
      //   const someVal = { value: Math.random() * Math.random() * Math.random() };
      //   delete someVal.value;
      // }
      Object.values(entities.gameState.people).forEach(p => {
        if (Math.random() > .999996) {
          if (entities.gameState.fastForward < HOUR) {
            entities.gameDispatch({
              type: 'notify',
              key: 'money',
              content: `${p.avatar}${p.name.given} ${p.name.family} found $100 on the ground!`,
            });
          }
        }
      });
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
