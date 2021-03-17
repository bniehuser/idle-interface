import { js as AStar } from 'easystarjs';
import { Map, MapPoint } from '../../entity/map';
import Simulation from '../../index';
import { SimulationEventType } from '../event';

const aStar = new AStar();
aStar.setAcceptableTiles([0, 1, 2, 4, 5]);
aStar.setTileCost(0, 2);
aStar.setTileCost(4, 2);
aStar.setTileCost(5, 2);

let READY = false;

Simulation.subscribeEvents(e => {
  const map = Simulation.state.map;
  if (map) {
    switch (e.sub) {
      case 'created':
        setGrid(map);
        break;
      default:
      // do nothing
    }
  }
}, SimulationEventType.Map);

const setGrid = (map: Map) => {
  console.log('should be setting grid...');
  const mapGrid = map.tiles.reduce((a, c, i) => {
    const [x, y] = [i % map.width, (i / map.width) | 0];
    if (a[y] === undefined) a[y] = [];
    a[y][x] = c.type;
    return a;
  }, [] as Array<number[]>);
  console.debug('mapGrid', mapGrid);
  aStar.setGrid(mapGrid);
  READY = true;
};

export const findPath = (s: MapPoint, e: MapPoint, cb: (path: MapPoint[]) => void) => {
  if (!READY) {
    const map = Simulation.state.map;
    if (map) {
      setGrid(map);
    }
  }
  aStar.findPath(s.x, s.y, e.x, e.y, cb);
  aStar.calculate();
};
