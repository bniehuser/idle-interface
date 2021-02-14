import { GameEngineSystem } from 'react-game-engine';
import moment from 'moment';
import { GameEntities } from '../../../context/game';

let lastHour = 0;
let running = false;

const runHourly = (entities: GameEntities) => new Promise((resolve) => {
  const hour = moment(entities.gameState.gameTime).hour();
  if (hour !== lastHour) {
    if (!running) {
      running = true;
      // for (let i = 0; i < 10000; i++) {
      //   const someVal = { value: Math.random() * Math.random() * Math.random() };
      //   delete someVal.value;
      // }
      Object.values(entities.gameState.people).forEach(p => {
        if (Math.random() > .9996) {
          entities.gameDispatch({type: 'notify', key: 'speech', content: `${p.avatar}${p.name.given} ${p.name.family} says 'hey!'`});
        }
        if (Math.random() > .9999) {
          entities.gameDispatch({type: 'notify', key: 'thought', content: `${p.avatar}${p.name.given} ${p.name.family} is daydreaming...`});
        }
        if (Math.random() > .9999) {
          entities.gameDispatch({type: 'notify', key: 'yell', content: `${p.avatar}${p.name.given} ${p.name.family} is VERY ANGRY...`});
        }
      });
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
