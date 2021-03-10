import { createPersonScratch, PersonScratch } from '../../../entity/person/person.scratch';
import Simulation from '../../../index';
import { SimulationScratch } from '../../../scratch';

const newBBPerson = createPersonScratch;

export const bbPerson = (id: number, bb: SimulationScratch = Simulation.scratch): PersonScratch => {
  const ppl = bb.people;
  if (!ppl[id]) {
    ppl[id] = newBBPerson();
  }
  return ppl[id];
};
