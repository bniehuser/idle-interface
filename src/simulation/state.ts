import { ALWAYS } from '../util/const/time';
import { DEFAULT_START_TIME } from './defaults';
import { Map } from './entity/map';
import { PeopleStore } from './entity/person';
import { RelationshipStore } from './entity/relationship';
import { SimulationEventParams } from './index';
import { SimulationFrequency } from './time';

export enum SimulationEventType {
  Always = '*',
  Notify = 'notify',
  Person = 'person',
  System = 'system',
  Save = 'save',
  Load = 'load',
  Error = 'error',
}
export type SimulationEventSubtype = number|string;

export interface SimulationEvent {
  type: SimulationEventType;
  sub: SimulationEventSubtype;
  id?: number;
  content: string|number;
  at: number;
}

export type SimulationSubscriber = (t: number) => void;
export type SimulationEventSubscriber = (...args: SimulationEventParams) => void;

export type SimulationSettings = {
  initialized: boolean;
  subscribers: {
    [k in (SimulationFrequency | typeof ALWAYS)]?: SimulationSubscriber[];
  };
  eventSubscribers: {[k in SimulationEventType]?: {[k in SimulationEventSubtype]?: SimulationEventSubscriber[]}}
  timeMultiplier: number;
  worldStartTime: number;
  _test?: string;
};

export interface SimulationState {
  _test?: {
    [k: string]: string | number,
  };
  realStart: number;
  gameTime: number;
  fastForward: number;
  personId: number;
  placeId: number;
  people: PeopleStore;
  relationships: RelationshipStore;
  map?: Map;
  events: SimulationEvent[];
  DEBUG: boolean;
}

export const createSimulationState = (): SimulationState => ({
  realStart: Date.now(),
  gameTime: DEFAULT_START_TIME,
  fastForward: 0,
  personId: 0,
  placeId: 0,
  people: {id: 0, all: {}, living: [], dead: []},
  relationships: {id: 0, all: {}, active: [], volatile: []},
  events: [],
  DEBUG: false,
});
