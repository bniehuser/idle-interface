import { DAY, WEEK } from '../../../util/const/time';
import { mergeDeep } from '../../../util/data-access';
import { createEvent, SimulationEvent } from './event';

export interface SimulationEventLog {
  id: number;
  current: SimulationEvent[];
  archive: SimulationEvent[];
}

export const createEventLog = (data: Partial<SimulationEventLog> = {}): SimulationEventLog => mergeDeep({
  id: 0,
  current: [],
  archive: [],
}, data);

const getEventExpiration = (evt: Partial<SimulationEvent>): number => {
  if (!evt.at) {
    console.error('tried to find expiration for event without an occurrence date:', evt);
    return 0;
  }
  // TODO: smarter logic for event expiration
  return evt.at + DAY;
};

export const addSimulationEvent = (log: SimulationEventLog, evt: Partial<SimulationEvent>): SimulationEvent => {
  log.id++;
  const e = createEvent({id: log.id, expires: getEventExpiration(evt), ...evt});
  log.current.push(e);
  return e;
};

const shouldArchive = (e: SimulationEvent, t: number) => (t - e.at) > WEEK;
const shouldCull = (e: SimulationEvent, t: number) => e.expires && e.expires <= t;

type SimulationEventLogUpdate = {archive: SimulationEvent[], current: SimulationEvent[]};

export const expireEventLog = (log: SimulationEventLog, t: number) => {
  // reduce and keep sorting in place, move and cull in a single reduce without upsetting any other log properties
  Object.assign(log, log.current.reduceRight((a, c) => {
    if (shouldArchive(c, t)) a.archive.unshift(c);
    if (!shouldCull(c, t)) a.current.unshift(c);
    return a;
  }, {archive: log.archive, current: []} as SimulationEventLogUpdate));
};
