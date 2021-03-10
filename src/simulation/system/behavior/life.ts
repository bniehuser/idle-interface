import moment from 'moment';
import Simulation from '../../index';
import { SimulationEventType } from '../event';
import { IsOld, IsVeryOld, KillPerson } from './person';
import { Notify } from './system';
import { PersonNode, RandomChance, Selector, Sequence } from './tree';

const ShouldMaybeDie: PersonNode = Sequence(
  IsOld,
  RandomChance(.00001),
  KillPerson('died of old age'),
);
const ShouldProbablyDie: PersonNode = Sequence(
  IsVeryOld,
  RandomChance(.001),
  KillPerson('died of very old age'),
);
export const ShouldDie: PersonNode = Selector(ShouldMaybeDie, ShouldProbablyDie);

export const Hobby: PersonNode = () => false;

export const Nap: PersonNode = () => false;

export const Birthday: PersonNode = id => {
  const p = Simulation.state.people.all[id];
  if (p && moment(p.birthday).dayOfYear() === moment(Simulation.scratch.processTime).dayOfYear()) {
    Simulation.event({type: SimulationEventType.Person, sub: 'birthday', entityId: id});
    return true;
  }
  return false;
};

export const SayHey: PersonNode = Sequence(
  RandomChance(.0004),
  id => Notify(`P{${id}} says 'hey'!`, 'speech')(id),
);

export const Daydream: PersonNode = Sequence(
  RandomChance(.0001),
  id => Notify(`P{${id}} is daydreaming...`, 'thought')(id),
);

export const GetAngry: PersonNode = Sequence(
  RandomChance(.0001),
  id => Notify(`P{${id}} is VERY ANGRY`, 'yell')(id),
);

export const FindMoney: PersonNode = Sequence(
  RandomChance(.000004),
  id => Notify(`P{${id}} found $100 on the ground!`, 'money')(id),
);
