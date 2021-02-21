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

const PROCESSING_TIME = 1000/120; // half a frame

const processAI = async (game: Game): Promise<void> => {
	RUNNING = true;
  return new Promise((resolve) => {
  	const { dispatch: d, blackboard: b } = game;
    const start = performance.now();
	  let processTime = 0;
	  let processed = 0;
    while((performance.now() - start) < PROCESSING_TIME && processTime !== b.now) {
    	processed++;
		const elapsed = b.now - b.processLastTime;
		let speed = 0;
		let useSpeed = 0;
		if (elapsed > MINUTE) {
			useSpeed = Math.min(HOUR, fastForwardFrequency(elapsed));
			// if(!notified) {
			// 	if (elapsed > (MINUTE * 15)) {
			// 		d({type: 'notify', content: `making up time, ${legibleTimeDiff(elapsed)} behind...`});
			// 	} else {
			// 		console.log(`catching up ${legibleTimeDiff(elapsed)}`);
			// 	}
			// 	notified = true;
			// }
			speed = elapsed < HOUR ? 0 : useSpeed; // only show modal if catching up more than an hour
			processTime = b.processLastTime + useSpeed;
		} else {
			processTime = b.now;
		}
		if (speed !== LAST_SPEED) {
			d({type: 'fastForward', speed});
			if (useSpeed) {
				d({type: 'notify', content: `making up time, ${legibleTimeDiff(elapsed)} behind...`});
			}
			LAST_SPEED = speed;
		}

		const m = moment(processTime);
		const CURRENT_MINUTE = m.minute();
		const CURRENT_HOUR = m.hour();
		const CURRENT_DAY = m.dayOfYear();

		b.processLastTime = b.processTime;
		b.processTime = processTime;

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
	}
	if(processed > 1) {
		console.log('ran', processed,'iterations in', performance.now()-start);
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
