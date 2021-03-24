import { randArrayItem } from '../data-access';

const ATTEMPTS_PER_POINT = 8;
const DEFAULT_RADIUS = 100;

export enum SamplingStrategy {
  Random = 'random',
  First = 'first',
  Last = 'last',
}

const DEFAULT_SAMPLING_STRATEGY = SamplingStrategy.Random;

type Vec2 = {
  x: number,
  y: number,
};

const pointWithin = (v: Vec2, tl: Vec2, br: Vec2) => {
  return v.x >= tl.x && v.x <= br.x && v.y >= tl.y && v.y <= br.y;
};

const rndWithin = (tl: Vec2, br: Vec2) => {
  return {
    x: tl.x + (Math.random() * (br.x - tl.x)),
    y: tl.y + (Math.random() * (br.y - tl.y)),
  };
};

const vecDist = (tl: Vec2, br: Vec2) => {
  return ({x: br.x - tl.x, y: br.y - tl.y});
};

const pointDist = (tl: Vec2, br: Vec2) => {
  return Math.sqrt(pointSqrDist(tl, br));
};

const pointSqrDist = (tl: Vec2, br: Vec2) => {
  const vd = vecDist(tl, br);
  return vd.x * vd.x + vd.y * vd.y;
};

const addPoints = (...points: Vec2[]) => {
  return points.reduce((a, c) => ({x: a.x + c.x, y: a.y + c.y}), {x: 0, y: 0});
};

export function generatePoints(
  useRnd: () => number,
  topLeft: Vec2,
  bottomRight: Vec2,
  densityAtPoint: (p: Vec2) => number = () => DEFAULT_RADIUS,
  samplingStrategy: SamplingStrategy = DEFAULT_SAMPLING_STRATEGY,
) {
  const rnd = useRnd || Math.random;

  let firstPoint = rndWithin(topLeft, bottomRight);

  let allPoints: Vec2[] = [firstPoint];
  let activePoints: Vec2[] = [firstPoint];

  let maxCount = 1000000;
  while (activePoints.length > 0 && allPoints.length < maxCount) {
    let currentPoint: Vec2;
    switch (samplingStrategy) {
      case SamplingStrategy.Random:
        currentPoint = randArrayItem(activePoints);
        break;
      case SamplingStrategy.First:
        currentPoint = activePoints[0];
        break;
      case SamplingStrategy.Last:
        currentPoint = activePoints[activePoints.length - 1];
        break;
      default:
        throw new Error('unhandled sampling strategy: ' + samplingStrategy);
    }

    let r = Math.max(0.1, Math.abs(densityAtPoint(currentPoint)));

    let placed = false;

    for (let i = 0; i < ATTEMPTS_PER_POINT; i++) {
      let dist = r + rnd() * r;
      let ang = rnd() * Math.PI * 2;
      let offset: Vec2 = { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist};
      let newPoint: Vec2 = addPoints(currentPoint, offset);

      let tooClose = !pointWithin(newPoint, topLeft, bottomRight);

      if (!tooClose) {
        let r2 = r * r;
        tooClose = allPoints.some(p => pointSqrDist(p, newPoint) < r2);
      }

      if (!tooClose) {
        if (((rnd() * 30) | 0) === 1)
          console.log(`adding ${JSON.stringify(newPoint)} : offset ${JSON.stringify(offset)}, r ${r}`);
        allPoints.push(newPoint);
        activePoints.push(newPoint);
        placed = true;
        break;
      }
    }
    if (!placed) {
      activePoints = activePoints.filter(p => p !== currentPoint);
    }
  }

  return allPoints;
}
