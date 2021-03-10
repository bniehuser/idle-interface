import { MINUTE } from '../util/const/time';
import { mergeDeep } from '../util/data-access';
import { DEFAULT_START_TIME } from './defaults';
import { PersonScratch } from './entity/person/person.scratch';
import { createSimulationInputScratch, SimulationInputScratch } from './system/input';
import { FrequencyStamps, lastStampsFor, SimulationFrequency } from './time';

// amazingly, thus far scratch is still a vanilla associative array style object -- completely serializable

// TODO: all this should be smarter.  get smarter barry, dammit.
export type PeopleScratch = {
  [k: number]: PersonScratch,
};
export type LocationsScratch = {
  [k: number]: any, // TODO: location entity scratch
};
export type RelationshipsScratch = {
  [k: number]: any, // TODO: relationship entity scratch
};
export type JobsScratch = {
  [k: number]: any, // TODO: job entity scratch
};
type MapScratch = any; // TODO: map entity scratch

export type SimulationScratch = {
  lastTime: number,
  realStartTime: number,
  lastSimulationTime: number;
  lastSimulationStamps: FrequencyStamps;
  people: PeopleScratch;
  locations: LocationsScratch;
  relationships: RelationshipsScratch;
  jobs: JobsScratch;
  map: MapScratch;
  speed: SimulationFrequency;
  processTime: number;
  input: SimulationInputScratch;
};

export const createSimulationScratch = (data: Partial<SimulationScratch> = {}): SimulationScratch => mergeDeep({
  lastTime: performance.now(),
  realStartTime: Date.now(),
  lastSimulationTime: DEFAULT_START_TIME,
  processTime: DEFAULT_START_TIME,
  lastSimulationStamps: lastStampsFor(DEFAULT_START_TIME),
  people: {},
  locations: {},
  relationships: {},
  jobs: {},
  map: {},
  speed: MINUTE,
  input: createSimulationInputScratch(),
}, data);
