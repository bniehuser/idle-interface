import { MINUTE } from '../util/const/time';
import { DEFAULT_START_TIME } from './defaults';
import { PersonScratch } from './index';
import { FrequencyStamps, lastStampsFor, SimulationFrequency } from './time';

export type PeopleScratch = {
  [k: number]: PersonScratch,
};

export type SimulationScratch = {
  lastTime: number,
  realStartTime: number,
  lastSimulationTime: number;
  lastSimulationStamps: FrequencyStamps;
  people: PeopleScratch;
  speed: SimulationFrequency;
  processTime: number;
};

export const createSimulationScratch = (): SimulationScratch => ({
  lastTime: performance.now(),
  realStartTime: Date.now(),
  lastSimulationTime: DEFAULT_START_TIME,
  processTime: DEFAULT_START_TIME,
  lastSimulationStamps: lastStampsFor(DEFAULT_START_TIME),
  people: {},
  speed: MINUTE,
});
