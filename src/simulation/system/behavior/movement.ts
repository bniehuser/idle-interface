import { HOUR } from '../../../util/const/time';
import { randArrayItem } from '../../../util/data-access';
import Simulation from '../../index';
import { getPersonScratch } from '../../scratch';
import { SimulationEventType } from '../event';
import { Defer } from './defer';
import { Inverter, PersonNode, RandomChance, Sequence } from './tree';

const ps = (id: number) => getPersonScratch(Simulation.scratch, id);

const IsMoving: PersonNode = id => ps(id).movement.moving;

const DoMove: PersonNode = id => {
  const p = ps(id);
  const m = Simulation.state.map;
  if (m) {
    const pl = randArrayItem([1, 4, 6, 20]);
    p.movement.path = Array.from(
      Array(pl),
      () => ({
        x: ((Math.random() * m.width) | 0),
        y: ((Math.random() * m.height) | 0),
      }),
    );
    p.movement.moving = true;
  }
  p.movement.speed = Math.random();
  Simulation.event({type: SimulationEventType.Person, sub: 'horse', data: `P{${id}} decided to move: ${JSON.stringify(p.movement.path)}`, entityId: id, public: true});
  return true;
};

export const StartMoving: PersonNode = Sequence(
  Inverter(IsMoving),
  RandomChance(.01),
  Defer(DoMove, () => Math.random() * HOUR),
);

export const HandleMovement: PersonNode = Sequence(
  IsMoving,
  id => {
    if (!ps(id).movement.path.length) {
      ps(id).movement.moving = false;
      Simulation.event({type: SimulationEventType.Person, sub: 'horse', data: `P{${id}} stopped moving.`, entityId: id, public: true});
      return false;
    }
    return true;
  },
);
