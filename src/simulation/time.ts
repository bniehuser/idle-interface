import moment from 'moment';
import { ALWAYS, CENTURY, DAY, DECADE, HOUR, MINUTE, MONTH, WEEK, YEAR } from '../util/const/time';

export const SIMULATION_FREQUENCIES = [MINUTE, HOUR, DAY, WEEK, MONTH, YEAR] as const; // not currently worried about DECADE or CENTURY
export type SimulationFrequency = typeof SIMULATION_FREQUENCIES[number];

export type FrequencyStamps = {[k in SimulationFrequency]: number};

export const lastStampsFor = (when: number): FrequencyStamps => {
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

export const SIMULATION_TIME_OFFSET = moment().utcOffset() * MINUTE;

type SimulationFrequencyList<T> = {[k in SimulationFrequency]: T};

type SimulationFrequencyComparator = (l: number, c: number) => boolean;

export const frequencyComparators: SimulationFrequencyList<SimulationFrequencyComparator> = {
  // well, always
  [ALWAYS]: () => true,
  // since everything's framed around a start time of midnight, the next three should work
  [MINUTE]: (l, c) => absoluteFreqDiff(MINUTE, l, c) > 0,
  [HOUR]: (l, c) => absoluteFreqDiff(HOUR, l, c) > 0,
  [DAY]: (l, c) => absoluteFreqDiff(DAY, l + SIMULATION_TIME_OFFSET, c + SIMULATION_TIME_OFFSET) > 0,
  // weeks are slightly iffy.  months and years are solid
  [WEEK]: (l, c) => absoluteWeek(c) - absoluteWeek(l) > 0,
  [MONTH]: (l, c) => absoluteMonth(c) - absoluteMonth(l) > 0,
  [YEAR]: (l, c) => moment(c).year() - moment(l).year() > 0,
  [DECADE]: (l, c) => decade(c) - decade(l) > 0,
  [CENTURY]: (l, c) => century(c) - century(l) > 0,
};
