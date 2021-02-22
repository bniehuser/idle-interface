import { Selector, Sequence, TNode } from './tree';
import { Daydream, GetAngry, Hobby, Nap, SayHey, ShouldDie } from './life';
import { Interact } from './interact';
import { IsIdle } from './person';

const AlwaysActions: TNode = Selector(SayHey, Daydream, GetAngry);
const IdleActions: TNode = Selector(Interact, Hobby, Nap, ShouldDie); // do the first one that works

export const HourlyTree: TNode = Selector(
  // Running,
  Sequence(IsIdle, IdleActions),
  AlwaysActions,
);
