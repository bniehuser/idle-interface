/** this _should_ be the primary simulation loop */
import { ALWAYS, CENTURY, DAY, DECADE, HOUR, MINUTE, MONTH, WEEK, YEAR } from '../util/const/time';
import moment from 'moment';
import { TIME_WARP } from './system/GameTime';

const frequencies = [MINUTE, HOUR, DAY, WEEK, MONTH, YEAR] as const; // not currently worried about DECADE or CENTURY
type SimulationFrequency = typeof frequencies[number];

let FRAME: number|undefined;
let SETTINGS: SimulationSettings = {
  initialized: false,
  subscribers: {},
};

type SimulationSubscriber = (t: number) => void;

export type SimulationSettings = {
  initialized: boolean;
  subscribers: {
    [k in (SimulationFrequency | typeof ALWAYS)]?: SimulationSubscriber[];
  }
};

const offset = moment().utcOffset() * MINUTE;

const init = (settings: Partial<SimulationSettings>) => {
  SETTINGS = Object.assign(SETTINGS, settings, {initialized: true});
};

type FrequencyStamps = {[k in SimulationFrequency]: number};

const lastStampsFor = (when: number): FrequencyStamps => {
  const m = moment(when);
  return ({
    [ALWAYS]: when,
    [MINUTE]: m.startOf('minute').valueOf(),
    [HOUR]: m.startOf('hour').valueOf(),
    [DAY]: m.startOf('day').valueOf(),
    [WEEK]: m.startOf('week').valueOf(),
    [MONTH]: m.startOf('month').valueOf(),
    [DECADE]: m.startOf('year').year(Math.floor(m.year() / 10) * 10).valueOf(),
    [CENTURY]: m.startOf('year').year(Math.floor(m.year() / 100) * 100).valueOf(),
  });
};

const absoluteFreqDiff = (f: SimulationFrequency, l: number, c: number) => Math.floor(c / f) - Math.floor(l / f);
const absoluteMonth = (d: number) => { const m = moment(d); return m.month() + m.year() * 12; };
const absoluteWeek = (d: number) => { const m = moment(d); return m.week() + m.year() * 52; };
const decade = (d: number) => Math.floor(moment(d).year() / 10) * 10;
const century = (d: number) => Math.floor(moment(d).year() / 100) * 100;

const frequencyComparators: {[k in SimulationFrequency]: (l: number, c: number) => boolean} = {
  // well, always
  [ALWAYS]: () => true,
  // since everything's framed around a start time of midnight, the next three should work
  [MINUTE]: (l, c) => absoluteFreqDiff(MINUTE, l, c) > 0,
  [HOUR]: (l, c) => absoluteFreqDiff(HOUR, l, c) > 0,
  [DAY]: (l, c) => absoluteFreqDiff(DAY, l + offset, c + offset) > 0,
  // weeks are slightly iffy.  months and years are solid
  [WEEK]: (l, c) => absoluteWeek(c) - absoluteWeek(l) > 0,
  [MONTH]: (l, c) => absoluteMonth(c) - absoluteMonth(l) > 0,
  [YEAR]: (l, c) => moment(c).year() - moment(l).year() > 0,
  [DECADE]: (l, c) => decade(c) - decade(l) > 0,
  [CENTURY]: (l, c) => century(c) - century(l) > 0,
};

export type PersonBlackboard = {
  near?: Array<{id: number, distance: number}>;
};

export type PeopleBlackboard = {
  [k: number]: PersonBlackboard,
};

export type SimulationBlackboard = {
  lastTime: number,
  realStartTime: number,
  lastSimulationTime: number;
  lastSimulationStamps: FrequencyStamps;
  people: PeopleBlackboard;
};

const simulationStartTime = moment('3600-06-01 00:00:00').valueOf();

const BB: SimulationBlackboard = {
  lastTime: performance.now(),
  realStartTime: Date.now(),
  lastSimulationTime: simulationStartTime,
  lastSimulationStamps: lastStampsFor(simulationStartTime),
  people: {},
};

const MAX_PROCESS_TIME = 1000 / 120; // half a 60fps frame

const main = (time: number) => {
  FRAME = requestAnimationFrame(main);
  // this is the main simulation loop
  const simulationTime = simulationStartTime + (Date.now() - BB.realStartTime) * TIME_WARP; // close enough
  const speed = MINUTE;

  SETTINGS.subscribers[ALWAYS]?.forEach(s => s(simulationTime));

  const timeout = performance.now() + MAX_PROCESS_TIME;
  let processTime = BB.lastSimulationTime + speed;
  while ((processTime < simulationTime) && performance.now() < timeout) {
    frequencies.forEach((f: SimulationFrequency) => {
      if (f >= speed && frequencyComparators[f](BB.lastSimulationTime, processTime) && SETTINGS.subscribers[f]) {
        SETTINGS.subscribers[f]?.forEach(s => s(processTime));
      }
    });
    BB.lastSimulationTime = processTime;
    processTime += speed;
  }
  if (processTime < simulationTime) {
    // we're behind
    console.log('did not catch up');
  }

  BB.lastTime = time; // totally unnecessary for our purposes, until we start messing with performance
};

const start = () => {
  if (!FRAME) {
    FRAME = requestAnimationFrame(main);
  }
};

const stop = () => {
  if (FRAME) {
    cancelAnimationFrame(FRAME);
    FRAME = undefined;
  }
};

const subscribe = (subscriber: SimulationSubscriber, type: SimulationFrequency = ALWAYS) => {
  if (!SETTINGS.subscribers[type]) SETTINGS.subscribers[type] = [];
  SETTINGS.subscribers[type]?.push(subscriber);
};

const unsubscribe = (subscriber: SimulationSubscriber, type: SimulationFrequency = ALWAYS) => {
  if (!SETTINGS.subscribers[type]) SETTINGS.subscribers[type] = [];
  SETTINGS.subscribers[type] = SETTINGS.subscribers[type]?.filter(s => s !== subscriber);
};

export type SimulationEngine = typeof Simulation;
const Simulation = { start, stop, init, subscribe, unsubscribe };

export default Simulation;
