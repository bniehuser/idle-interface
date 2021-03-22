import { MINUTE } from '../util/const/time';
import { mergeDeep } from '../util/data-access';
import { DEFAULT_START_TIME } from './defaults';
import { createPersonScratch, PersonScratch } from './entity/person';
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
type MapScratch = {
  offset: [number, number],
  scale: number,
}; // TODO: map entity scratch

export type SimulationScratch = {
  lastTime: number,
  realStartTime: number,
  lastSimulationTime: number;
  lastSimulationStamps: FrequencyStamps;
  hoveredPerson?: number;
  people: PeopleScratch;
  locations: LocationsScratch;
  relationships: RelationshipsScratch;
  jobs: JobsScratch;
  map: MapScratch;
  speed: SimulationFrequency;
  processTime: number;
  catchUpFrom: number;
  input: SimulationInputScratch;
  loading: { active: boolean, message: string, progress: number };
};

export const createSimulationScratch = (data: Partial<SimulationScratch> = {}): SimulationScratch => mergeDeep({
  lastTime: performance.now(),
  realStartTime: Date.now(),
  lastSimulationTime: DEFAULT_START_TIME,
  processTime: DEFAULT_START_TIME,
  catchUpFrom: 0,
  lastSimulationStamps: lastStampsFor(DEFAULT_START_TIME),
  hoveredPerson: undefined,
  people: {},
  locations: {},
  relationships: {},
  jobs: {},
  map: {
    offset: [0, 0],
    scale: 1,
  },
  speed: MINUTE,
  input: createSimulationInputScratch(),
  loading: { active: false, message: '', progress: 0 },
}, data);

export const addPersonScratch = (scratch: SimulationScratch, id: number) => {
  const s = createPersonScratch();
  scratch.people[id] = s;
  return s;
};

export const findPersonScratch = (scratch: SimulationScratch, id: number): PersonScratch => scratch.people[id];
export const getPersonScratch = (scratch: SimulationScratch, id: number) => findPersonScratch(scratch, id) || addPersonScratch(scratch, id);
