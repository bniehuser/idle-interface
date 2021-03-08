import { MINUTE } from '../util/const/time';
import { DEFAULT_START_TIME } from './defaults';
import { PersonScratch } from './index';
import { FrequencyStamps, lastStampsFor, SimulationFrequency } from './time';

export type PeopleScratch = {
  [k: number]: PersonScratch,
};

export type SimulationInputScratch = {
  mouse: {
    down: boolean,
    x: number,
    y: number,
    scroll: number,
    [k: string]: any,
  },
};

export type SimulationScratch = {
  lastTime: number,
  realStartTime: number,
  lastSimulationTime: number;
  lastSimulationStamps: FrequencyStamps;
  people: PeopleScratch;
  speed: SimulationFrequency;
  processTime: number;
  input: SimulationInputScratch;
};

export const createSimulationScratch = (): SimulationScratch => ({
  lastTime: performance.now(),
  realStartTime: Date.now(),
  lastSimulationTime: DEFAULT_START_TIME,
  processTime: DEFAULT_START_TIME,
  lastSimulationStamps: lastStampsFor(DEFAULT_START_TIME),
  people: {},
  speed: MINUTE,
  input: {
    mouse: {
      down: false,
      scroll: 0,
      x: 0,
      y: 0,
    },
  },
});
