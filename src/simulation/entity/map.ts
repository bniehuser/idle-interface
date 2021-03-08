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
  {name: 'wall', walkable: 0, position: [0, 128]},
  {name: 'floor', walkable: 100, position: [96, 128]},
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

export const createMap = (opts: Partial<MapCreationOptions>): Map => {
  const mapOpts: MapCreationOptions = Object.assign(defaultMapOptions, opts);
  const {width, height, tileSize} = mapOpts;
  const tileIdx = makeTileIdxFinder(width);
  const tiles: MapTile[] = [];
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      tiles[tileIdx(x, y)] = {type: Math.random() < .2 ? (Math.random() < .5 ? 4 : 5) : 0};
    }
  }
  const map = {width, height, tiles, tileSize};

  // so now we have an empty map.  what next?
  const thirdX = Math.floor(width / 3);
  const roadX = thirdX + Math.floor(Math.random() * thirdX); // somewhere in the middle
  const thirdY = Math.floor(height / 3);
  const roadY = thirdY + Math.floor(Math.random() * thirdY); // somewhere in the middle

  if (Math.random() < .5) {
    makeRoad(map, 'y', roadX, 2);
    makeRoad(map, 'x', roadY);
  } else {
    makeRoad(map, 'x', roadY, 2);
    makeRoad(map, 'y', roadX);
  }

  console.log(map);

  return map;
};

// THESE WILL FAIL IF GIVEN NUMS OUTSIDE RANGE
const makeTileIdxFinder = (width: number) => (x: number, y: number): number => width * y + x;
const makeTileFinder = (map: Map) => (x: number, y: number): undefined | MapTile => map.tiles[map.width * y + x];
const makeTilePropsFinder = (map: Map) => (x: number, y: number): undefined | MapTileProperties => mapTileTypes[map.tiles[map.width * y + x]?.type];

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
