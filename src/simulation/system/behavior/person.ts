import Simulation from '../../index';
import { PersonNode } from './tree';

const person = (id: number) => Simulation.state.people.all[id];

export const IsOld: PersonNode = id => person(id).age > 60;
export const IsVeryOld: PersonNode = id => person(id).age > 80;
export const IsIdle: PersonNode = id => person(id).ai.decision === 'idle';
export const IsBusy: PersonNode = id => person(id).ai.decision === 'busy';

export const KillPerson = (reason: string): PersonNode => id => {
  // just do it here?
  Simulation.event('killPerson', id, reason);
  return true;
};
