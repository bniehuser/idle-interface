import { HOUR, legibleTimeDiff } from '../../../util/const/time';
import { randArrayItem } from '../../../util/data-access';
import { mapDistance } from '../../entity/map';
import Simulation from '../../index';
import { SimulationEventType } from '../event';
import { Defer } from './defer';
import { PersonNode, RandomChance, Sequence } from './tree';
import { getPersonScratch } from '../../scratch';

export const FIND_PEOPLE_DISTANCE = 10;

const scratchPerson = (id: number) => getPersonScratch(Simulation.scratch, id);
const statePerson = (id: number) => Simulation.state.people.all[id];
const t = () => Simulation.scratch.processTime;

export const FindPeople: PersonNode = id => {
  const bp = scratchPerson(id);

  if (t() - (scratchPerson(id)?.near?.lastCheck || 0) > Simulation.scratch.speed) {
    const p = statePerson(id);
    bp.near = {
      lastCheck: t(),
      people: Simulation.state.people.living.reduce((a, c) => {
        if (c !== id) {
          const np = statePerson(c);
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
  const b = scratchPerson(id);
  b.target = parseInt(randArrayItem(Object.keys(b.near.people)), 10);
  return true;
};

export const BeginInteraction: PersonNode = id => {
  const i = scratchPerson(id);
  const s = scratchPerson(i.target);
  s.initiated = true;
  s.interacting = i.interacting = true;
  s.interactionInitiated = i.interactionInitiated = t();
  s.target = id;
  return true;
};

export const IsInteracting: PersonNode = id => scratchPerson(id).interacting;

export const FinishInteraction: PersonNode = id => {
  const i = scratchPerson(id);
  const s = scratchPerson(i.target);
  s.interacting = i.interacting = false;
  let ip = statePerson(id);
  let tp = statePerson(i.target);
  if (s.initiated) {
    const s = ip;
    ip = tp;
    tp = s;
  }
  Simulation.event({
    type: SimulationEventType.Notify,
    sub: 'speech',
    data: `P(${ip.id}) talked to P(${tp.id}) for ${legibleTimeDiff(t() - i.interactionInitiated)}`,
  });
  s.initiated = i.initiated = false;
  s.interactionInitiated = i.interactionInitiated = 0;
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
