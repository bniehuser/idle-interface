import { Interact } from './interact';
import { Daydream, GetAngry, Hobby, Nap, SayHey, ShouldDie } from './life';
import { IsIdle } from './person';
import { PersonNode, Selector, Sequence } from './tree';

const AlwaysActions: PersonNode = Selector(SayHey, Daydream, GetAngry);
const IdleActions: PersonNode = Selector(Interact, Hobby, Nap, ShouldDie); // do the first one that works

export const HourlyTree: PersonNode = Selector(
  // Running,
  Sequence(IsIdle, IdleActions),
  AlwaysActions,
);
