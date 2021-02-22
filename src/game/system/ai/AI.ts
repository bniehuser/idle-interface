import { GameEngineSystem } from 'react-game-engine';
import { runMomentary } from './momentary';
import { runHourly } from './hourly';
import { runDaily } from './daily';
import { fastForwardFrequency, HOUR, legibleTimeDiff, MINUTE } from '../../../util/const/time';
import { Game } from '../../../context/game';
import moment from 'moment';

let LAST_MINUTE = 0;
let LAST_HOUR = 0;
let LAST_DAY = 0;
let LAST_SPEED = 0;

const PROCESSING_TIME = 1000 / 120; // half a frame

const processAI = async (game: Game): Promise<void> => {
  RUNNING = true;
  return new Promise((resolve) => {
    const {dispatch: d, blackboard: b} = game;
    const start = performance.now();
    let processTime = 0;
    let processed = 0;
    let speed = 0;
    let elapsed = b.now - b.processLastTime;
    while ((performance.now() - start) < PROCESSING_TIME && processTime !== b.now) {
      processed++;
      if (elapsed > MINUTE) {
        speed = Math.min(HOUR, fastForwardFrequency(elapsed));
        processTime = b.processLastTime + speed;
      } else {
        processTime = b.now;
        speed = 0;
      }

      const m = moment(processTime);
      const CURRENT_MINUTE = m.minute();
      const CURRENT_HOUR = m.hour();
      const CURRENT_DAY = m.dayOfYear();

      if (b.processTime < b.processLastTime) {
        console.log('going backwards... but how?', b.processTime, b.processLastTime, b.now);
      }

      b.processLastTime = b.processTime;
      b.processTime = processTime;
      b.speed = speed;

      if (CURRENT_MINUTE !== LAST_MINUTE) {
        runMomentary(game);
        LAST_MINUTE = CURRENT_MINUTE;
      }
      if (CURRENT_HOUR !== LAST_HOUR) {
        runHourly(game);
        LAST_HOUR = CURRENT_HOUR;
      }
      if (CURRENT_DAY !== LAST_DAY) {
        runDaily(game, CURRENT_DAY);
        LAST_DAY = CURRENT_DAY;
      }
      elapsed = b.now - b.processLastTime;
    }
    if (processed > 1) {
      console.log('ran', processed, 'iterations in', performance.now() - start, b.now === processTime);
    }
    if (speed !== LAST_SPEED) {
      if (speed === 0 || speed > MINUTE) {
        d({type: 'fastForward', speed});
        if (speed) {
          if (!b.catchUpFrom) { b.catchUpFrom  = b.lastProcessTime; }
          d({type: 'notify', content: `making up time, ${legibleTimeDiff(elapsed)} behind...`});
        } else {
          b.catchUpFrom = 0;
        }
      } else {
        console.log(`catching up ${legibleTimeDiff(elapsed)}`);
      }
      LAST_SPEED = speed;
    }
    RUNNING = false;
    resolve();
  });
};

let RUNNING = false;

const AI: GameEngineSystem = (game: Game) => {
  if (!RUNNING) {
    processAI(game);
  } else {
    console.log('skipped...');
  }
  return game;
};

export default AI;
