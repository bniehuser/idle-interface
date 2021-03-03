import moment from 'moment';
import { SimulationSettings } from './state';

export const DEFAULT_START_TIME = moment('3600-06-01 00:00:00').valueOf();
export const DEFAULT_TIME_MULTIPLIER = 1000; // one thousand times realtime

export const createSimulationSettings = (): SimulationSettings => { console.log('CREATING SETTINGS'); return {
  initialized: false,
  subscribers: {},
  eventSubscribers: {},
  timeMultiplier: DEFAULT_TIME_MULTIPLIER,
  worldStartTime: DEFAULT_START_TIME,
};};
