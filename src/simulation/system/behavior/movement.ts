import { HOUR } from '../../../util/const/time';
import { isWalkable, Map, MapPoint } from '../../entity/map';
import Simulation from '../../index';
import { getPersonScratch } from '../../scratch';
import { SimulationEventType } from '../event';
import { findPath } from '../movement/pathfinding';
import { Defer } from './defer';
import { Inverter, PersonNode, RandomChance, Sequence } from './tree';

const ps = (id: number) => getPersonScratch(Simulation.scratch, id);
const p = (id: number) => Simulation.state.people.all[id];

const IsMoving: PersonNode = id => ps(id).movement.moving;

// let ALERTED = false;

const DoMove: PersonNode = id => {
  const scr = ps(id);
  const m = Simulation.state.map;
  if (m) {
    let dp: MapPoint;
    do {
      dp = {
        x: ((Math.random() * m.width) | 0),
        y: ((Math.random() * m.height) | 0),
      };
    } while (!isWalkable(Simulation.state.map as Map, dp));
    // const fpstart = performance.now();
    findPath(p(id).location, dp, path => {
      if (path) {
        scr.movement.speed = Math.random();
        scr.movement.path = path;
        scr.movement.moving = true;
        // if(!ALERTED) {
        //   alert(JSON.stringify([p(id).location, dp, path.slice(0, 20)]));
        //   ALERTED = true;
        // }
      }
      // console.log('found path (', path, ') in ', performance.now() - fpstart);
    });
    //
    //
    // const pl = randArrayItem([1, 4, 6, 20]);
    // p.movement.path = Array.from(
    //   Array(pl),
    //   () => {
    //     let p: MapPoint;
    //     do {
    //       p = {
    //         x: ((Math.random() * m.width) | 0),
    //         y: ((Math.random() * m.height) | 0),
    //       };
    //     } while (!isWalkable(Simulation.state.map as Map, p));
    //     return p;
    //   },
    // );
  }
  Simulation.event({type: SimulationEventType.Person, sub: 'horse', data: `P{${id}} decided to move: ${JSON.stringify(scr.movement.path)}`, entityId: id, public: true});
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
