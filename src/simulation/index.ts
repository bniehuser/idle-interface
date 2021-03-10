/** this _should_ be the primary simulation loop */
import { ALWAYS, DAY } from '../util/const/time';
import { mergeDeep } from '../util/data-access';
import { createSimulationSettings } from './defaults';
import { createSimulationScratch, SimulationScratch } from './scratch';
import {
  createSimulationState,
  SimulationEventSubscriber,
  SimulationSettings,
  SimulationState,
  SimulationSubscriber,
} from './state';
import {
  addSimulationEvent,
  expireEventLog,
  SimulationEvent,
  SimulationEventSubtype,
  SimulationEventType,
} from './system/event';
import { createWindowListeners, disableInput, enableInput } from './system/input';
import { frequencyComparators, SIMULATION_FREQUENCIES, SimulationFrequency } from './time';

let FRAME: number|undefined;
const MAX_PROCESS_TIME = 1000 / 120; // half a 60fps frame

const SETTINGS: SimulationSettings = createSimulationSettings();
const SCRATCH: SimulationScratch = createSimulationScratch();
const STATE: SimulationState = createSimulationState();
const WINDOW_LISTENERS = createWindowListeners(SCRATCH.input);

const init = (settings: Partial<SimulationSettings>) => {
  // override settings
  mergeDeep(SETTINGS, settings);
  // set up default (internal) subscribers
  subscribe(t => expireEventLog(STATE.events, t), DAY);
  subscribeEvents(evt => console.debug(evt), SimulationEventType.Error);
  // set initialized
  SETTINGS.initialized = true;
};

const main = (time: number) => {
  FRAME = requestAnimationFrame(main);
  const simulationTime = SETTINGS.worldStartTime + (Date.now() - SCRATCH.realStartTime) * SETTINGS.timeMultiplier; // close enough

  SETTINGS.subscribers[ALWAYS]?.forEach(s => s(simulationTime));

  const timeout = performance.now() + MAX_PROCESS_TIME;
  SCRATCH.processTime = SCRATCH.lastSimulationTime + SCRATCH.speed;
  let iterations = 0;
  while ((SCRATCH.processTime < simulationTime) && performance.now() < timeout) {
    iterations++;
    SIMULATION_FREQUENCIES.forEach((f: SimulationFrequency) => {
      if (f >= SCRATCH.speed && frequencyComparators[f](SCRATCH.lastSimulationTime, SCRATCH.processTime) && SETTINGS.subscribers[f]) {
        SETTINGS.subscribers[f]?.forEach(s => s(SCRATCH.processTime));
      }
    });
    SCRATCH.lastSimulationTime = SCRATCH.processTime;
    SCRATCH.processTime += SCRATCH.speed;
  }
  if (SCRATCH.processTime < simulationTime) {
    // we're behind
    console.log('did not catch up, tried iterations: ', iterations);
  }

  SCRATCH.lastTime = time; // totally unnecessary for our purposes, until we start messing with performance
};

const start = () => {
  if (!FRAME) {
    enableInput(WINDOW_LISTENERS);
    FRAME = requestAnimationFrame(main);
  } else {
    event({type: SimulationEventType.Error, sub: 'simulationStart', data: 'Simulation already started!'});
  }
};

const stop = () => {
  if (FRAME) {
    cancelAnimationFrame(FRAME);
    disableInput(WINDOW_LISTENERS);
    FRAME = undefined;
  } else {
    event({type: SimulationEventType.Error, sub: 'simulationStop', data: 'Simulation not running!'});
  }
};

const subscribe = (subscriber: SimulationSubscriber, type: SimulationFrequency = ALWAYS) => {
  if (!SETTINGS.subscribers[type]?.length) {
    SETTINGS.subscribers[type] = [subscriber];
  } else {
    SETTINGS.subscribers[type]?.push(subscriber);
  }
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

const event = (init: Partial<SimulationEvent>) => {
  const evt = addSimulationEvent(STATE.events, {at: SCRATCH.processTime, ...init});
  SETTINGS.eventSubscribers['*']?.['*']?.forEach(s => s(evt));
  SETTINGS.eventSubscribers[evt.type]?.['*']?.forEach(s => s(evt));
  if (evt.sub !== undefined) {
    SETTINGS.eventSubscribers[evt.type]?.[evt.sub]?.forEach(s => s(evt));
  }
};

// this is the outside world's interface to the Simulation -- nothing that isn't an internal system should touch it outside this interface

// it's fairly pure, but there are tons of operations we might want to perform for data management as well
// but those should all take place in a context where we're already including the sim, so all operations should take the appropriate
// state or scratch as input, so that they're completely agnostic from a running sim

// exceptions being sim systems -- these all assume a running sim for speed
const Simulation = {
  scratch: SCRATCH,
  state: STATE,
  settings: SETTINGS,
  start,
  stop,
  init,
  subscribe,
  unsubscribe,
  subscribeEvents,
  unsubscribeEvents,
  event,
};

export default Simulation;
