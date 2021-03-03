import Simulation, { PersonBlackboard, SimulationBlackboard } from '../../../index';

const newBBPerson = (): PersonBlackboard => ({
  target: 0,
  interactionInitiated: 0,
  interacting: false,
  initiated: false,
  near: {
    lastCheck: 0,
    people: {},
  },
  deferred: [],
});

export const bbPerson = (id: number, bb: SimulationBlackboard = Simulation.scratch): PersonBlackboard => {
  const ppl = bb.people;
  if (!ppl[id]) {
    ppl[id] = newBBPerson();
  }
  return ppl[id];
};
