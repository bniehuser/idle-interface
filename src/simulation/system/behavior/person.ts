import Simulation from '../../index';
import { SimulationEventType } from '../event';
import { PersonNode } from './tree';

const person = (id: number) => Simulation.state.people.all[id];

export const IsOld: PersonNode = id => person(id).age > 60;
export const IsVeryOld: PersonNode = id => person(id).age > 80;
export const IsIdle: PersonNode = id => person(id).ai.decision === 'idle';
export const IsBusy: PersonNode = id => person(id).ai.decision === 'busy';

export const KillPerson = (reason: string): PersonNode => id => {
  // just do it here?  can run function to accomplish it, or can let event drive it but keep that code elsewhere
  // need to determine desired practice for all behaviors
  Simulation.state.people.living = Simulation.state.people.living.filter(i => i !== id);
  Simulation.state.people.dead.push(id);
  Simulation.event({type: SimulationEventType.Person, sub: 'coffin', entityId: id, data: `P{${id}) ${reason}`, public: true});
  return true;
};
