import { HOUR, legibleTimeDiff } from '../../../util/const/time';
import { randArrayItem } from '../../../util/data-access';
import { mapDistance } from '../../entity/map';
import Simulation from '../../index';
import { SimulationEventType } from '../../state';
import { Defer } from './defer';
import { PersonNode, RandomChance, Sequence } from './tree';
import { bbPerson } from './util/blackboard';

const {scratch, state} = Simulation; // do these retain data?

export const FIND_PEOPLE_DISTANCE = 10;

export const FindPeople: PersonNode = id => {
  const bp = bbPerson(id, scratch);

  if (scratch.processTime - (scratch.people[id]?.near?.lastCheck || 0) > scratch.speed) {
    const ppl = state.people.living;
    const p = state.people.all[id];
    bp.near = {
      lastCheck: scratch.processTime,
      people: ppl.reduce((a, c) => {
        if (c !== id) {
          const np = state.people.all[c];
          const d = mapDistance(p.location, np.location);
          if (d < FIND_PEOPLE_DISTANCE) {
            a[c] = d;
          }
        }
        return a;
      }, {} as { [k: number]: number }),
    };
  }
  return !!Object.keys(bp.near.people).length;
};

export const TargetForInteraction: PersonNode = id => {
  const b = bbPerson(id);
  b.target = parseInt(randArrayItem(Object.keys(b.near.people)), 10);
  return true;
};

export const BeginInteraction: PersonNode = id => {
  const i = bbPerson(id);
  const t = bbPerson(i.target);
  i.initiated = true;
  t.interacting = i.interacting = true;
  t.interactionInitiated = i.interactionInitiated = scratch.processTime;
  t.target = id;
  return true;
};

export const IsInteracting: PersonNode = id => bbPerson(id).interacting;

export const FinishInteraction: PersonNode = id => {
  const i = bbPerson(id);
  const t = bbPerson(i.target);
  t.interacting = i.interacting = false;
  let ip = state.people.all[id];
  let tp = state.people.all[i.target];
  if (t.initiated) {
    const s = ip;
    ip = tp;
    tp = s;
  }
  Simulation.event(SimulationEventType.Notify, 'speech', `${ip.avatar}${ip.name.given} ${ip.name.family} talked to ${tp.avatar}${tp.name.given} ${tp.name.family} for ${legibleTimeDiff(scratch.processTime - i.interactionInitiated)}`);
  t.initiated = i.initiated = false;
  t.interactionInitiated = i.interactionInitiated = 0;
  return true;
};

const MakeInteraction = Sequence(
  FindPeople,
  TargetForInteraction,
  BeginInteraction,
);

export const Interact: PersonNode = Sequence(
  RandomChance(.01),
  FindPeople,
  Defer(MakeInteraction, () => Math.floor(Math.random() * HOUR)),
);
