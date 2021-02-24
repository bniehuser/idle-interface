import { RandomChance, Selector, Sequence, TNode } from './tree';
import { IsBusy } from './person';
import { FindMoney } from './life';
import { MINUTE } from '../../../../util/const/time';
import { FinishInteraction, IsInteracting } from './interact';
import { DoDeferred } from './defer';

const IsMoving: TNode = () => false;
const DoMovement: TNode = () => false;
const DoInteraction: TNode = () => false;

const DoBusyWork: TNode = Selector(
  Sequence(IsMoving, DoMovement),
  Sequence(IsInteracting, DoInteraction),
);

const BASE_INTERACTION_END = .025 / MINUTE;

const HandleInteraction: TNode = Sequence(
  IsInteracting,
  (p, g) => {
    const chance = (g.blackboard.processTime - g.blackboard.people[p.id].interactionInitiated) * BASE_INTERACTION_END;
    // console.log('checking to end interaction, chance: ', chance);
    return RandomChance(chance)(p, g);
  },
  FinishInteraction,
);

export const MomentaryTree: TNode = Selector(
  Sequence(IsBusy, DoBusyWork),
  HandleInteraction,
  DoDeferred,
  FindMoney,
);
