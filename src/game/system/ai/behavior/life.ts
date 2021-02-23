import { RandomChance, Selector, Sequence, TNode } from './tree';
import { IsOld, IsVeryOld, KillPerson } from './person';
import { Notify } from './system';
import moment from 'moment';

const ShouldMaybeDie: TNode = Sequence(
  IsOld,
  RandomChance(.00001),
  KillPerson('died of old age'),
);
const ShouldProbablyDie: TNode = Sequence(
  IsVeryOld,
  RandomChance(.001),
  KillPerson('died of very old age'),
);
export const ShouldDie: TNode = Selector(ShouldMaybeDie, ShouldProbablyDie);

export const Hobby: TNode = () => false;

export const Nap: TNode = () => false;

export const Birthday: TNode = (p, g) => {
  if (moment(p.birthday).dayOfYear() === moment(g.blackboard.processTime).dayOfYear()) {
    g.dispatch({type: 'personBirthday', person: p});
    return true;
  }
  return false;
};

export const SayHey: TNode = Sequence(
  RandomChance(.0004),
  (p, g) => Notify(`P{${p.id}} says 'hey'!`, 'speech')(p, g),
);

export const Daydream: TNode = Sequence(
  RandomChance(.0001),
  (p, g) => Notify(`P{${p.id}} is daydreaming...`, 'thought')(p, g),
);

export const GetAngry: TNode = Sequence(
  RandomChance(.0001),
  (p, g) => Notify(`P{${p.id}} is VERY ANGRY`, 'yell')(p, g),
);

export const FindMoney: TNode = Sequence(
  RandomChance(.000004),
  (p, g) => Notify(`P{${p.id}} found $100 on the ground!`, 'money')(p, g),
);
