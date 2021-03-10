import { ALWAYS } from '../util/const/time';
import { mergeDeep } from '../util/data-access';
import { DEFAULT_START_TIME } from './defaults';
import { Map } from './entity/map';
import { RelationshipStore } from './entity/relationship';
import {
  createEventLog,
  SimulationEvent,
  SimulationEventLog,
  SimulationEventSubtype,
  SimulationEventType,
} from './system/event';
import { SimulationFrequency } from './time';
import { createPersonStore, PersonStore } from './entity/person';

export type SimulationSubscriber = (t: number) => void;
export type SimulationEventSubscriber = (e: SimulationEvent) => void;

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
  simulationTime: number;
  fastForward: number;
  personId: number;
  placeId: number;
  people: PersonStore;
  relationships: RelationshipStore;
  map?: Map;
  events: SimulationEventLog;
  DEBUG: boolean;
}

export const createSimulationState = (data: Partial<SimulationState> = {}): SimulationState => mergeDeep({
    realStart: Date.now(),
    simulationTime: DEFAULT_START_TIME,
    fastForward: 0,
    personId: 0,
    placeId: 0,
    people: createPersonStore(),
    relationships: {id: 0, all: {}, active: [], volatile: []},
    events: createEventLog(),
    DEBUG: false,
}, data);
