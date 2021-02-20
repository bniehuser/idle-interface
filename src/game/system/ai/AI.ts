import { GameEngineSystem } from 'react-game-engine';
import MomentaryAI from './MomentaryAI';
import HourlyAI from './HourlyAI';
import DailyAI from './DailyAI';
import { fastForwardFrequency, legibleTimeDiff, MINUTE } from '../../../util/const/time';

const AI: GameEngineSystem = (entities, opts) => {
  const elapsed = entities.gameState.gameTime - entities.gameState.gameLastTime;
  let newEntities = entities;
  if (elapsed > MINUTE) {
    const speed = fastForwardFrequency(elapsed);
    entities.gameDispatch({type: 'fastForward', speed, processTime: entities.gameState.gameLastTime + speed});
    entities.gameDispatch({type: 'notify', content: `making up time, ${legibleTimeDiff(elapsed)} behind...`});
  } else {
    entities.gameDispatch({type: 'fastForward', speed: 0, processTime: entities.gameState.gameTime});
  }
  newEntities = MomentaryAI(newEntities, opts);
  newEntities = HourlyAI(newEntities, opts);
  newEntities = DailyAI(newEntities, opts);
  return newEntities;
};

export default AI;
