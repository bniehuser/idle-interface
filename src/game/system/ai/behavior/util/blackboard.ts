import { GameBlackboard } from '../../../../../context/game';

const newBBPerson = () => ({
  target: undefined,
  near: {
    lastCheck: 0,
    people: {},
  },
});

export const bbPerson = (id: number, bb: GameBlackboard) => {
  const ppl = bb.people;
  if (!ppl) {
    console.error('why are there no people?', bb);
    return;
  }
  if (!ppl[id]) {
    ppl[id] = newBBPerson();
  }
  return ppl[id];
};
