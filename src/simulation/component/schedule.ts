import { mergeDeep } from '../../util/data-access';

type Days = 0|1|2|3|4|5|6;

export type Schedule = {
  [k in Days]?: Array<Obligation>;
};

export type ObligationType = 'life'|'job'|'hobby'|'event';

// how to handle obligations that bleed into next day?  set end to > 1 day, i guess
export interface Obligation {
  type: ObligationType;
  name: string; // TODO: formalize this, so obligations can be completely validated
  start: number;
  startOffset: [number, number];
  end: number;
  endOffset: [number, number];
  description?: string;
}

const withinRange = (a: number, b: number): number => a + Math.floor(Math.random() * (b - a));

export const getObligationStart = (o: Obligation): number => withinRange(o.start + o.startOffset[0], o.start + o.startOffset[1]);
export const getObligationEnd = (o: Obligation): number => withinRange(o.end + o.endOffset[0], o.end + o.endOffset[1]);

export const createSchedule = (data: Partial<Schedule> = {}): Schedule => mergeDeep({
}, data);