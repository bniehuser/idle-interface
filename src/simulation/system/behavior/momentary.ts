import { MINUTE } from '../../../util/const/time';
import Simulation from '../../index';
import { DoDeferred } from './defer';
import { FinishInteraction, IsInteracting } from './interact';
import { FindMoney } from './life';
import { IsBusy } from './person';
import { BehaviorNode, PersonNode, RandomChance, Selector, Sequence } from './tree';
import { bbPerson } from './util/blackboard';

const IsMoving: BehaviorNode = () => false;
const DoMovement: BehaviorNode = () => false;
const DoInteraction: BehaviorNode = () => false;

const DoBusyWork: BehaviorNode = Selector(
  Sequence(IsMoving, DoMovement),
  Sequence(IsInteracting, DoInteraction),
);

const BASE_INTERACTION_END = .025 / MINUTE;

const HandleInteraction: PersonNode = Sequence(
  IsInteracting,
  id => {
    const chance = (Simulation.scratch.processTime - bbPerson(id).interactionInitiated) * BASE_INTERACTION_END;
    // console.log('checking to end interaction, chance: ', chance);
    return RandomChance(chance)(id);
  },
  FinishInteraction,
);

export const MomentaryTree: BehaviorNode = Selector(
  Sequence(IsBusy, DoBusyWork),
  HandleInteraction,
  DoDeferred,
  FindMoney,
);
