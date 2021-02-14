export interface Schedule {
  obligations: Array<Obligation>;
}

export type ObligationType = 'job'|'hobby'|'event';

export interface Obligation {
  type: ObligationType;
  days: Array<number>;
  startTime: Date;
  endTime: Date;
  priority: number;
}
