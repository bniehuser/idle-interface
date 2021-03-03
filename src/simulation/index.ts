/** this _should_ be the primary simulation loop */
import { ALWAYS, DAY, HOUR } from '../util/const/time';
import { mergeDeep } from '../util/data-access';
import { createSimulationSettings } from './defaults';
import { cullEvents } from './event';
import { createSimulationScratch, SimulationScratch } from './scratch';
import {
  createSimulationState,
  SimulationEventSubscriber,
  SimulationEventSubtype,
  SimulationEventType,
  SimulationSettings,
  SimulationState,
  SimulationSubscriber,
} from './state';
import { frequencyComparators, SIMULATION_FREQUENCIES, SimulationFrequency } from './time';

let FRAME: number|undefined;
const MAX_PROCESS_TIME = 1000 / 120; // half a 60fps frame

const SETTINGS: SimulationSettings = createSimulationSettings();
const SCRATCH: SimulationScratch = createSimulationScratch();
const STATE: SimulationState = createSimulationState();

const init = (settings: Partial<SimulationSettings>) => {
  console.log('NOW INIT:', SETTINGS.subscribers[HOUR], SETTINGS.subscribers[HOUR]?.length, settings.subscribers?.[HOUR], settings.subscribers?.[HOUR].length);
  // override settings
  mergeDeep(SETTINGS, settings);
  console.log('NOW MERGED:', SETTINGS.subscribers[HOUR], SETTINGS.subscribers[HOUR]?.length);
  // set up default (internal) subscribers
  subscribe(t => cullEvents(t), DAY);
  subscribeEvents((t, s, d) => console.debug(t, s, d), SimulationEventType.Error);
  // set initialized
  SETTINGS.initialized = true;
};

const main = (time: number) => {
  FRAME = requestAnimationFrame(main);
  const simulationTime = SETTINGS.worldStartTime + (Date.now() - SCRATCH.realStartTime) * SETTINGS.timeMultiplier; // close enough

  SETTINGS.subscribers[ALWAYS]?.forEach(s => s(simulationTime));

  const timeout = performance.now() + MAX_PROCESS_TIME;
  SCRATCH.processTime = SCRATCH.lastSimulationTime + SCRATCH.speed;
  while ((SCRATCH.processTime < simulationTime) && performance.now() < timeout) {
    SIMULATION_FREQUENCIES.forEach((f: SimulationFrequency) => {
      if (f >= SCRATCH.speed && frequencyComparators[f](SCRATCH.lastSimulationTime, SCRATCH.processTime) && SETTINGS.subscribers[f]) {
        if (f === HOUR) {
          console.log('should run hourly subscribers', SETTINGS._test);
        }
        SETTINGS.subscribers[f]?.forEach(s => s(SCRATCH.processTime));
      }
    });
    SCRATCH.lastSimulationTime = SCRATCH.processTime;
    SCRATCH.processTime += SCRATCH.speed;
  }
  if (SCRATCH.processTime < simulationTime) {
    // we're behind
    console.log('did not catch up');
  }

  SCRATCH.lastTime = time; // totally unnecessary for our purposes, until we start messing with performance
};

const start = () => {
  if (!FRAME) {
    FRAME = requestAnimationFrame(main);
  } else {
    event(SimulationEventType.Error, 'simulationStart', 'Simulation already started!');
  }
};

const stop = () => {
  if (FRAME) {
    cancelAnimationFrame(FRAME);
    FRAME = undefined;
  } else {
    event(SimulationEventType.Error, 'simulationStop', 'Simulation not running!');
  }
};

const subscribe = (subscriber: SimulationSubscriber, type: SimulationFrequency = ALWAYS) => {
  if (!SETTINGS.subscribers[type]?.length) {
    SETTINGS.subscribers[type] = [subscriber];
  } else {
    SETTINGS.subscribers[type]?.push(subscriber);
  }
  console.log('after subscription: ', type, SETTINGS.subscribers);
};

const unsubscribe = (subscriber: SimulationSubscriber, type: SimulationFrequency = ALWAYS) => {
  if (!SETTINGS.subscribers[type]) SETTINGS.subscribers[type] = [];
  SETTINGS.subscribers[type] = SETTINGS.subscribers[type]?.filter(s => s !== subscriber);
};

const subscribeEvents = (subscriber: SimulationEventSubscriber, type: SimulationEventType = SimulationEventType.Always, sub: SimulationEventSubtype = '*') => {
  SETTINGS.eventSubscribers[type] = {
    ...SETTINGS.eventSubscribers[type],
    [sub]: [
      ...(SETTINGS.eventSubscribers[type]?.[sub] || []),
      subscriber,
    ],
  };
};

const unsubscribeEvents = (subscriber: SimulationEventSubscriber, type: SimulationEventType = SimulationEventType.Always, sub: SimulationEventSubtype = '*') => {
  SETTINGS.eventSubscribers[type] = {
    ...SETTINGS.eventSubscribers[type],
    [sub]: (SETTINGS.eventSubscribers[type]?.[sub] || []).filter(s => s !== subscriber),
  };
};

export type SimulationEventParams = [type: SimulationEventType, sub: SimulationEventSubtype, data: string|any];

const event = (...args: SimulationEventParams) => {
  SETTINGS.eventSubscribers['*']?.['*']?.forEach(s => s(...args));
  SETTINGS.eventSubscribers[args[0]]?.['*']?.forEach(s => s(...args));
  SETTINGS.eventSubscribers[args[0]]?.[args[1]]?.forEach(s => s(...args));
};

export type SimulationEngine = typeof Simulation;
const Simulation = { start, stop, init, subscribe, unsubscribe, subscribeEvents, unsubscribeEvents, event, scratch: SCRATCH, state: STATE, settings: SETTINGS };

export default Simulation;
