import { RandomChance, Sequence, TNode } from './tree';
import { randArrayItem } from '../../../../util/data-access';
import { distance } from '../../../entity/map';
import { bbPerson } from './util/blackboard';
import { legibleTimeDiff } from '../../../../util/const/time';

export const FIND_PEOPLE_DISTANCE = 10;

export const FindPeople: TNode = (p, g) => {
  const b = g.blackboard;
  if (!b.people[p.id]) {
    b.people[p.id] = {
      near: {},
    };
  }
  const bp = b.people[p.id];
  if (b.processTime - (b.people[p.id]?.near?.lastCheck || 0) > b.speed) {
    const ppl = g.state.living;
    bp.near = {
      lastCheck: b.processTime,
      people: ppl.reduce((a, c) => {
        if (c !== p.id) {
          const np = g.state.people[c];
          const d = distance(p.location, np.location);
          if (d < FIND_PEOPLE_DISTANCE) {
            a[c] = d;
          }
        }
        return a;
      }, {} as {[k: number]: number}),
    };
  }
  return !!Object.keys(bp.near.people).length;
};

export const TargetForInteraction: TNode = (p, g) => {
  const b = g.blackboard.people[p.id];
  b.target = parseInt(randArrayItem(Object.keys(b.near.people)), 10);
  return true;
};

export const BeginInteraction: TNode = (p, g) => {
  const i = bbPerson(p.id, g.blackboard);
  const t = bbPerson(i.target, g.blackboard);
  i.initiated = true;
  t.interacting = i.interacting = true;
  t.interactionInitiated = i.interactionInitiated = g.blackboard.processTime;
  t.target = p.id;
  return true;
};

export const IsInteracting: TNode = (p, g) => !!bbPerson(p.id, g.blackboard).interacting;

export const FinishInteraction: TNode = (p, g) => {
  const i = bbPerson(p.id, g.blackboard);
  const t = bbPerson(i.target, g.blackboard);
  t.interacting = i.interacting = false;
  let ip = g.state.people[p.id];
  let tp = g.state.people[i.target];
  if (t.initiated) {
    const s = ip;
    ip = tp;
    tp = s;
  }
  g.dispatch({type: 'notify', key: 'speech', content: `${ip.avatar}${ip.name.given} ${ip.name.family} talked to ${tp.avatar}${tp.name.given} ${tp.name.family} for ${legibleTimeDiff(g.blackboard.processTime - i.interactionInitiated)}`});
  t.initiated = i.initiated = false;
  t.interationInitiated = i.interationInitiated = undefined;
  return true;
};

export const Communicate: TNode = (p, g) => {
  const b = g.blackboard.people[p.id];
  const t = g.state.people[b.target];
  g.dispatch({type: 'notify', key: 'speech', content: `${p.avatar}${p.name.given} ${p.name.family} talked to ${t.avatar}${t.name.given} ${t.name.family}`});
  b.target = randArrayItem(b.near.people);
  return true;
};

export const Interact: TNode = Sequence(
  FindPeople,
  RandomChance(.01),
  TargetForInteraction,
  BeginInteraction,
);
