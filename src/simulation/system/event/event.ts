import { mergeDeep } from '../../../util/data-access';

export enum SimulationEventType {
  Always = '*',
  Notify = 'notify',
  Person = 'person',
  Map = 'map',
  System = 'system',
  Save = 'save',
  Load = 'load',
  Error = 'error',
}
export type SimulationEventSubtype = number|string;

export type SimulationEventData = string|any;

export interface SimulationEvent {
  id: number;
  type: SimulationEventType;
  sub?: SimulationEventSubtype;
  entityId?: number; // could be any entity
  data?: SimulationEventData;
  at: number; // occurred at
  expires: number; // remove after
  public:  boolean; // shown in public log
}

export const createEvent = (data: Partial<SimulationEvent>): SimulationEvent => mergeDeep({
  id: 0,
  type: SimulationEventType.Error,
  at: 0,
  expires: 0,
  public: false,
}, data);
