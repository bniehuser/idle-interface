import { OverlappingModel } from 'wavefunctioncollapse';
import { SimulationScratch } from '../scratch';

export interface MapPoint {
  x: number;
  y: number;
}

export interface MapTile {
  type: number;
}

export interface Map {
  width: number;
  height: number;
  tileSize: number;
  tiles: MapTile[];
}

export interface MapTileProperties {
  name: string;
  walkable: number; // integer, represents percentage normal speed 0-100
  position: [number, number]; // tile sprite position for tile
}

export const mapTileTypes: MapTileProperties[] = [
  {name: 'ground', walkable: 50, position: [0, 32]},
  {name: 'path', walkable: 100, position: [0, 64]},
  {name: 'floor', walkable: 100, position: [0, 128]},
  {name: 'wall', walkable: 0, position: [96, 128]},
  {name: 'flowers1', walkable: 50, position: [32, 32]},
  {name: 'flowers2', walkable: 50, position: [64, 32]},
];

export const tileTypeNamed = (name: string) => mapTileTypes.find(t => t.name === name);

export const mapDistance = (f: MapPoint, t: MapPoint) => {
  const x = t.x - f.x;
  const y = t.y - f.y;
  return Math.sqrt(x * x + y * y);
};

export type MapCreationOptions = {
  width: number,
  height: number,
  tileSize: number,
};

const defaultMapOptions: MapCreationOptions = {
  width: 200,
  height: 200,
  tileSize: 32,
};

// interface MapRoad {
//   axis: 'x'|'y';
//   position: number;
//   width?: number;
//   start?: number;
//   end?: number;
// }

const makeRoad = (map: Map, axis: 'x' | 'y', position: number, width: number = 1, start: number = 0, end: number = 0) => {
  const tile = makeTileFinder(map);
  let e: number;
  switch (axis) {
    case 'x':
      e = end ? Math.min(map.height, end + 1) : map.height;
      for (let i = start; i < e; i++) {
        for (let w = 0; w < width; w++) {
          const t = tile(position + w, i);
          if (t) t.type = 1;
        }
      }
      break;
    case 'y':
      e = end ? Math.min(map.width, end + 1) : map.width;
      for (let i = start; i < e; i++) {
        for (let w = 0; w < width; w++) {
          const t = tile(i, position + w);
          if (t) t.type = 1;
        }
      }
      break;
    default:
      throw new Error('invalid axis for road: ' + axis);
  }
};

const makeBuilding = (map: Map, position: [number, number], size: [number, number]) => {
  const tile = makeTileFinder(map);
  for (let x = position[0]; x < position[0] + size[0]; x++) {
    for (let y = position[1]; y < position[1] + size[1]; y++) {
      const t = tile(x, y);
      if (t) {
        if (x === position[0] || x === position[0] + size[0] - 1 || y === position[1] || y === position[1] + size[1] - 1) {
          t.type = 3;
        } else {
          t.type = 2;
        }
      }
    }
  }
};

const rand = (min: number = 0, max: number = 1) => {
  return Math.random() * (max - min) + min;
};
const randInt = (min: number = 0, max: number = 10) => {
  return rand(min, max) | 0;
};
const randGround = () => Math.random() < .2 ? (Math.random() < .5 ? 4 : 5) : 0;

export const createMap = async (scratch: SimulationScratch, opts: Partial<MapCreationOptions>): Promise<Map> => {
  scratch.loading.message = 'Creating map...';
  scratch.loading.active = true;
  const map = await createRealMap(scratch, opts);
  scratch.loading.active = false;
  return map;
};

export const createRealMap = async (scratch: SimulationScratch, opts: Partial<MapCreationOptions>): Promise<Map> => {
  const mapOpts: MapCreationOptions = Object.assign(defaultMapOptions, opts);
  const {width, height, tileSize} = mapOpts;
  const tileIdx = makeTileIdxFinder(width);
  const tiles: MapTile[] = [];
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      tiles[tileIdx(x, y)] = {type: randGround()};
    }
  }
  const map = {width, height, tiles, tileSize};

  // ok we're going to do this completely differently
  const hw = width / 2;
  const hh = height / 2;
  const v = Math.min(width / height) / 7;
  const center = {x: hw + randInt(-v, v), y: hh + randInt(-v, v)};
  const minTownSize = Math.min(hw, hh);
  const maxTownSize = Math.min(width * .8, height * .8);
  const cw = randInt(minTownSize, maxTownSize);
  const ch = randInt(minTownSize, maxTownSize);

  // create 'town' box
  const townOrigin = { x: center.x - ((cw / 2) | 0), y: center.y - ((ch / 2) | 0)};
  const townBox = [townOrigin.x, townOrigin.y, townOrigin.x + cw, townOrigin.y + ch];

  // break into subdivisions for 'city blocks'
  const blockSize = 50;
  let numBlocksX = (cw / blockSize) | 0;
  if (cw % blockSize > blockSize / 2) { numBlocksX++; }
  let numBlocksY = (ch / blockSize) | 0;
  if (ch % blockSize > blockSize / 2) { numBlocksY++; }
  // make roads?  make blocks?  either way we need to keep track of both.
  // keep arrays of x/y subdivisions
  let lw = cw;
  const xdiv = [0];
  const roadsx = [[-2, 2]];
  let i = 0;
  while (lw > blockSize) {
    const thisBlockWidth = blockSize + randInt(-2, 2);
    const rw = (i === ((numBlocksX / 2) | 0) ? randInt(3, 4) : 2);
    // xpos is ROAD START
    const xpos = cw - lw + thisBlockWidth - rw;
    roadsx.push([xpos, rw]);
    xdiv.push(xpos + rw);
    lw = cw - xpos;
    i++;
  }
  xdiv.push(cw);
  roadsx.push([cw, 2]);

  let lh = ch;
  const ydiv = [0];
  const roadsy = [[-2, 2]];
  i = 0;
  while (lh > blockSize) {
    const thisBlockHeight = blockSize + randInt(-2, 2);
    const rw = (i === ((numBlocksY / 2) | 0) ? randInt(3, 4) : 2);
    const ypos = cw - lh + thisBlockHeight - rw;
    roadsy.push([ypos, rw]);
    ydiv.push(ypos + rw);
    lh = cw - (ypos + rw);
    i++;
  }
  ydiv.push(ch);
  roadsy.push([ch, 2]);
  const blocks: Array<[number, number, number, number]> = [];
  // okay, now use those divisions to make blocks
  for (let x = 0; x < roadsx.length - 1; x++) {
    for (let y = 0; y < roadsy.length - 1; y++) {
      const blockX = townBox[0] + roadsx[x][0] + roadsx[x][1];
      const blockY = townBox[1] + roadsy[y][0] + roadsy[y][1];
      const blockW = townBox[0] + roadsx[x + 1][0] - blockX;
      const blockH = townBox[1] + roadsy[y + 1][0] - blockY;
      blocks.push([blockX, blockY, blockX + blockW, blockY + blockH]);
    }
  }

  // stop here, figure it out and display it so we can tweak accordingly
  roadsx.forEach(r => makeRoad(map, 'x', townBox[0] + r[0], r[1], r[1] > 2 ? 0 : townBox[1], r[1] > 2 ? 0 : townBox[3]));
  roadsy.forEach(r => makeRoad(map, 'y', townBox[1] + r[0], r[1], r[1] > 2 ? 0 : townBox[0], r[1] > 2 ? 0 : townBox[2]));
//  blocks.forEach(b => makeBuilding(map, [b[0] + randInt(1, 3), b[1] + randInt(1, 3)], [b[2] - b[0] - randInt(3, 5), b[3] - b[1] - randInt(3, 5)]));

  const w: [number, number, number, number] = [255, 255, 255, 255];
  const b: [number, number, number, number] = [0, 0, 0, 255];
  const g: [number, number, number, number] = [127, 127, 127, 255];
  const makePx = (pa: [number, number, number, number][]) => {
    return new Uint8ClampedArray(pa.reduce((a, c) => a.concat(c), [] as number[]));
  };
  const imgPx = makePx([
    w, w, w, w, w, w, w, w, w, w, w, w,
    w, b, b, b, b, b, w, w, w, w, w, w,
    w, b, g, g, g, b, w, w, w, w, w, w,
    w, b, g, g, g, g, w, w, b, b, b, w,
    w, b, g, g, g, b, w, w, b, g, b, w,
    w, b, b, b, g, b, w, w, b, g, b, w,
    w, b, g, g, g, b, b, b, b, g, b, w,
    w, b, g, g, g, b, g, b, g, g, b, w,
    w, b, b, b, b, b, g, b, g, g, b, w,
    w, w, w, w, b, g, g, b, g, g, b, w,
    w, w, w, w, b, b, b, b, g, b, b, w,
    w, w, w, w, w, w, w, w, w, w, w, w,
  ]);

  const img2px = makePx([
    w, w, w, w, w, w, w, w, w, w, w, w,
    w, b, b, b, b, b, w, w, w, w, w, w,
    w, b, g, g, g, b, w, w, b, g, b, w,
    w, g, g, g, g, b, b, b, b, g, b, w,
    w, b, g, g, g, b, g, b, g, g, b, b,
    w, b, g, b, b, b, g, g, g, g, g, b,
    w, b, g, g, g, g, g, b, g, g, g, b,
    w, b, b, b, b, b, b, b, b, g, g, g,
    w, b, g, g, g, g, g, g, b, g, g, b,
    w, b, g, g, g, b, b, b, b, g, b, b,
    w, b, g, b, b, b, w, b, g, g, b, w,
    w, w, w, w, w, w, w, b, b, b, b, w,
  ]);

  scratch.loading.progress = 10;
  // const incr = 90 / blocks.length;

  blocks.forEach(b => {
    const bw = b[2] - b[0];
    const bh = b[3] - b[1];
    if (bw < 10 ||  bh < 10) {
      return;
    }
    const t = new OverlappingModel(img2px, 12, 12, 3, bw, bh, true, false, 8);
    console.log('generating overlapping model...', b, b[2] - b[0], b[3] - b[1]);
    let s = false;
    let tries = 0;
    while (!s && tries < 10) {
      s = t.generate(Math.random);
      tries++;
    }
    if (s) {
      const v = t.graphics();
      if (v) {
        for (let i = 0; i < v.length / 4; i++) {
          const gx = b[0] + (i % bw);
          const gy = b[1] + ((i / bw) | 0);
          const tile = map.tiles[gy * map.width + gx];
          if (tile) {
            tile.type = v[i * 4] === 0 ? 3 : (v[i * 4] === 127 ? 2 : randGround());
          } else {
            console.error('no tile:', gx, gy);
          }
        }
      }
    } else {
      throw new Error('could not generate');
    }
  });

  // manipulate blocks into features (city center, park, etc)
  // make a park
  // subdivide blocks into lots
  // place buildings on lots
  // decorate lots
  // draw 'roads' between / through blocks
  // place fringe lots
  // place buildings on fringe lots
  // use noise to generate 'nature' outside town

  // so now we have an empty map.  what next?
  // const thirdX = Math.floor(width / 3);
  // const roadX = thirdX + Math.floor(Math.random() * thirdX); // somewhere in the middle
  // const thirdY = Math.floor(height / 3);
  // const roadY = thirdY + Math.floor(Math.random() * thirdY); // somewhere in the middle
  //
  //
  // if (Math.random() < .5) {
  //   makeRoad(map, 'y', roadX, 4);
  //   makeRoad(map, 'x', roadY, 3);
  // } else {
  //   makeRoad(map, 'x', roadY, 4);
  //   makeRoad(map, 'y', roadX, 3);
  // }
  //
  // const BLOCK = 60;
  //
  // // how big is a 'block?  20 spaces?
  // // before x
  // let nr = 1 + ((Math.random() * 2) | 0);
  // for (let i = 0; i < nr; i++) {
  //   const nrx = roadX - (BLOCK + i * BLOCK);
  //   const s = (Math.random() * thirdY) | 0;
  //   const e = height - ((Math.random() * thirdY) | 0);
  //   makeRoad(map, 'y', nrx, 2, s, e);
  // }
  // // after x
  // nr = 1 + ((Math.random() * 2) | 0);
  // for (let i = 0; i < nr; i++) {
  //   const nrx = roadX + (BLOCK + i * BLOCK);
  //   const s = (Math.random() * thirdY) | 0;
  //   const e = height - ((Math.random() * thirdY) | 0);
  //   makeRoad(map, 'y', nrx, 2, s, e);
  // }
  // // before y
  // nr = 1 + ((Math.random() * 2) | 0);
  // for (let i = 0; i < nr; i++) {
  //   const nry = roadY - (BLOCK + i * BLOCK);
  //   const s = (Math.random() * thirdX) | 0;
  //   const e = width - ((Math.random() * thirdX) | 0);
  //   makeRoad(map, 'x', nry, 2, s, e);
  // }
  // // after y
  // nr = 1 + ((Math.random() * 2) | 0);
  // for (let i = 0; i < nr; i++) {
  //   const nry = roadY + (BLOCK + i * BLOCK);
  //   const s = (Math.random() * thirdX) | 0;
  //   const e = width - ((Math.random() * thirdX) | 0);
  //   makeRoad(map, 'x', nry, 2, s, e);
  // }
  //
  // const BUILDINGX = 16;
  // const BUILDINGY = 16;
  //
  // for (let x = roadX - (BLOCK + 2) * 3; x <= roadX + (BLOCK + 2) * 2; x += (BLOCK + 2)) {
  //   for (let y = roadY - (BLOCK + 2) * 3; y <= roadY + (BLOCK + 2) * 2; y += (BLOCK + 2)) {
  //     for (let bx = x; bx <= x + (BLOCK + 2) - BUILDINGX; bx += BUILDINGX) {
  //       for (let by = y; by <= y + (BLOCK + 2) - BUILDINGY; by += BUILDINGY) {
  //         makeBuilding(map, [bx + 1, by + 1], [BUILDINGX - 2, BUILDINGY - 2]);
  //       }
  //     }
  //   }
  // }

    console.log(map);
  scratch.loading.active = false;

  return map;
};

// THESE WILL FAIL IF GIVEN NUMS OUTSIDE RANGE
const makeTileIdxFinder = (width: number) => (x: number, y: number): number => width * y + x;
export const makeTileFinder = (map: Map) => (x: number, y: number): undefined | MapTile => map.tiles[map.width * y + x];
export const makeTilePropsFinder = (map: Map) => (x: number, y: number): undefined | MapTileProperties => mapTileTypes[map.tiles[map.width * y + x]?.type];

// make a texture pixel map
export const makeMapTexture = (map: Map): Uint8Array => {
  const pixArray = new Uint8Array(map.width * map.height * 4);
  for (let i = 0; i < map.tiles.length; i++) {
    const idx = i * 4;
    pixArray[idx] = Math.min(mapTileTypes[map.tiles[i].type].position[0], 255);
    pixArray[idx + 1] = Math.min(mapTileTypes[map.tiles[i].type].position[1], 255);
    pixArray[idx + 2] = 0; // we'll use these later -- walkable?  lightable? tile rotation/variant? many flag options
    pixArray[idx + 3] = 255; // leave full alpha in case we want to visualize it
  }
  return pixArray;
};

export interface MapDisplay {
  map: Map;
  canvas: HTMLCanvasElement;
  spriteCanvas: HTMLCanvasElement;
  spriteBuffer: HTMLCanvasElement;
  tileImg: HTMLImageElement;
  spriteImg: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D; // subject to reimplementation
}

export const renderMap = (mapDisplay: MapDisplay, pxOffsetX: number = 0, pxOffsetY: number = 0, width: number = 0, height: number = 0) => {
  const {map, canvas, ctx, tileImg} = mapDisplay;
  const {tileSize, width: mw, height: mh} = map;
  const getTile = makeTilePropsFinder(map);
  const sx = Math.max(0, Math.floor(-pxOffsetX / tileSize));
  const sy = Math.max(0, Math.floor(-pxOffsetY / tileSize));
  const ex = Math.min(mw, width || Math.ceil((canvas.width - pxOffsetX) / tileSize));
  const ey = Math.min(mh, height || Math.ceil((canvas.height - pxOffsetY) / tileSize));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let x = sx; x <= ex; x++) {
    for (let y = sy; y <= ey; y++) {
      const tile = getTile(x, y);
      if (tile) {
        ctx.drawImage(
          tileImg,
          tile.position[0],
          tile.position[1],
          tileSize,
          tileSize,
          x * tileSize + pxOffsetX,
          y * tileSize + pxOffsetY,
          tileSize,
          tileSize,
        );
      }
    }
  }
};

export const isWalkable = (map: Map, m: MapPoint): boolean => !!makeTilePropsFinder(map)(m.x, m.y)?.walkable;
