import moment from 'moment';
import { YEAR } from '../../../util/const/time';
import { calcAvatar } from '../../entity/person';
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
    const age = ((Simulation.scratch.processTime - p.birthday) / YEAR) | 0;
    p.avatar = calcAvatar(p.gender, p.skinTone, age);
    p.age = age;
    Simulation.event({type: SimulationEventType.Person, sub: 'birthday', entityId: id, data: `Happy V{${age},*} birthday, P{${id}}!`, public: true, expires: 0});
    return true;
  }
  return false;
};

export const SayHey: PersonNode = Sequence(
  RandomChance(.0004),
  id => Notify(`P{${id}} says 'hey'!`, 'speech', id)(id),
);

export const Daydream: PersonNode = Sequence(
  RandomChance(.0001),
  id => Notify(`P{${id}} is daydreaming...`, 'thought', id)(id),
);

export const GetAngry: PersonNode = Sequence(
  RandomChance(.0001),
  id => Notify(`P{${id}} is VERY ANGRY`, 'yell', id)(id),
);

export const FindMoney: PersonNode = Sequence(
  RandomChance(.000004),
  id => Notify(`P{${id}} found V{$100,money} on the ground!`, 'luck', id)(id),
);
