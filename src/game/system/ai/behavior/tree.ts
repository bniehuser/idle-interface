import { Game } from '../../../../context/game';
import { Person } from '../../../entity/person';
import { MapPoint } from '../../../entity/map';
import { randArrayItem } from '../../../../util/data-access';
import { EmojiKey } from '../../../../util/emoji';

// let's simplify things greatly
type TNode = (p: Person, g: Game) => boolean;

// Composite
export const Sequence = (...children: TNode[]): TNode => (p, g) => children.every(c => c(p, g));
export const Selector = (...children: TNode[]): TNode => (p, g) => children.some(c => c(p, g));

// Decorator
export const Inverter = (child: TNode): TNode => (p, g) => !child(p, g);

// Generator
export const RandomChance = (chance: number): TNode => () => Math.random() < chance;

// Leaf
const IsOld: TNode = (p) => p.age > 80;
const IsIdle: TNode = (p) => p.ai.decision === 'idle';
const IsBusy: TNode = (p) => p.ai.decision === 'busy';

// shards
export const KillPerson = (reason: string): TNode => (p, g) => {
  g.dispatch({type: 'killPerson', personId: p.id, reason});
  return true;
};

const distance = (f: MapPoint, t: MapPoint) => {
  const x = t.x - f.x;
  const y = t.y - f.y;
  return Math.sqrt(x * x + y * y);
};

const FIND_PEOPLE_DISTANCE = 10;

const FindPeople: TNode = (p, g) => {
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

const ShouldDie: TNode = Sequence(
  IsOld,
  RandomChance(.00001),
  KillPerson('died of old age'),
);

const TargetForInteraction: TNode = (p, g) => {
  const b = g.blackboard.people[p.id];
  b.target = parseInt(randArrayItem(Object.keys(b.near.people)), 10);
  return true;
};

const Communicate: TNode = (p, g) => {
  const b = g.blackboard.people[p.id];
  const t = g.state.people[b.target];
  g.dispatch({type: 'notify', key: 'speech', content: `${p.avatar}${p.name.given} ${p.name.family} talked to ${t.avatar}${t.name.given} ${t.name.family}`});
  b.target = randArrayItem(b.near.people);
  return true;
};

const Notify = (content: string, key?: EmojiKey): TNode => (_, g) => {
  g.dispatch({type: 'notify', key, content});
  return true;
};

const Interact: TNode = Sequence(
  FindPeople,
  RandomChance(.01),
  TargetForInteraction,
  Communicate,
);
const Hobby: TNode = () => false;
const Nap: TNode = () => false;
const SayHey: TNode = Sequence(
  RandomChance(.0004),
  (p, g) => Notify(`${p.avatar}${p.name.given} ${p.name.family} says 'hey'!`, 'speech')(p, g),
);
const Daydream: TNode = Sequence(
  RandomChance(.0001),
  (p, g) => Notify(`${p.avatar}${p.name.given} ${p.name.family} is daydreaming...`, 'thought')(p, g),
);
const GetAngry: TNode = Sequence(
  RandomChance(.0001),
  (p, g) => Notify(`${p.avatar}${p.name.given} ${p.name.family} is VERY ANGRY`, 'yell')(p, g),
);
const FindMoney: TNode = Sequence(
  RandomChance(.000004),
  (p, g) => Notify(`${p.avatar}${p.name.given} ${p.name.family} found $100 on the ground!`, 'money')(p, g),
);

const IdleActions: TNode = Selector(Interact, Hobby, Nap, ShouldDie); // do the first one that works
const AlwaysActions: TNode = Selector(SayHey, Daydream, GetAngry);

// const Running: TNode = (p) => { console.log('running behavior tree for', p.id); return true; };

// main
export const HourlyTree: TNode = Selector(
  // Running,
  Sequence(IsIdle, IdleActions),
  AlwaysActions,
);

const bbPerson = (p: Person, g: Game) => {
  return g.blackboard.people[p.id];
};

const IsMoving: TNode = () => false;
const DoMovement: TNode = () => false;
const IsInteracting: TNode = (p, g) => !!bbPerson(p, g)?.target;
const DoInteraction: TNode = () => false;

const DoBusyWork: TNode = Selector(
  Sequence(IsMoving, DoMovement),
  Sequence(IsInteracting, DoInteraction),
);

export const MomentaryTree: TNode = Selector(
  Sequence(IsBusy, DoBusyWork),
  FindMoney,
);
