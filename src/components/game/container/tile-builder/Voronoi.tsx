import React, { FC, useEffect, useState } from 'react';
import { Cell, Diagram, Edge, Halfedge, Voronoi } from 'voronoijs';
import { OverlappingModel } from 'wavefunctioncollapse';
import { generatePoints } from '../../../../util/geometry/poisson';

type Vec2 = { x: number, y: number };

const samePoint = (a: Vec2, b: Vec2) => {
  // give a little wiggle room
  return Math.round(a.x * 1000) === Math.round(b.x * 1000) && Math.round(a.y * 1000) === Math.round(b.y * 1000);
};

const sameLine = (a: { va: Vec2, vb: Vec2 }, b: { va: Vec2, vb: Vec2 }) => {
  return (samePoint(a.va, b.va) && samePoint(a.vb, b.vb)) || (samePoint(a.va, b.vb) && samePoint(a.vb, b.va));
};

const lineSlope = (b: Vec2, e: Vec2) => {
  return (e.y - b.y) / (e.x - b.x);
};

const edgeSlope = (e: Edge) => {
  return Math.atan((e.vb.y - e.va.y) / (e.vb.x - e.va.x));
};

const sqr = (x: number) => x * x;
const dist2 = (v: Vec2, w: Vec2) => sqr(v.x - w.x) + sqr(v.y - w.y);
const distToSegmentSquared = (p: Vec2, v: Vec2, w: Vec2) => {
  const l2 = dist2(v, w);
  if (l2 === 0) return dist2(p, v);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
};
const distToSegment = (p: Vec2, v: Vec2, w: Vec2) => Math.sqrt(distToSegmentSquared(p, v, w));

const nextPoint = (p: Vec2, up: Vec2[], sp: Vec2, ep: Vec2, el: Edge[]) => {
  const res = el.reduce((a, c) => {
    const tp = samePoint(c.va, p) ? c.vb : (samePoint(c.vb, p) ? c.va : null);
    return tp && p.x !== tp.x && p.y !== tp.y && (dist2(tp, ep) < dist2(a, ep)) ? tp : a; // && !up.some(u => samePoint(u, tp)) && distToSegment(tp, sp, ep) < distToSegment(a, sp, ep) ? tp : a;
  }, sp);
  return samePoint(res, sp) ? null : res;
};

const angleDelta = (a1: number, a2: number) => Math.atan2(Math.sin(a1 - a2), Math.cos(a1 - a2));

const strokeLine = (ctx: CanvasRenderingContext2D, sp: Vec2, ep: Vec2, color: string = '#000', width: number = 1) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  // ctx.globalAlpha = .5;
  ctx.beginPath();
  ctx.moveTo(sp.x, sp.y);
  ctx.lineTo(ep.x, ep.y);
  ctx.stroke();
  ctx.restore();
};

const cellBB = (cell: Cell) => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  cell.halfedges.forEach(e => {
    [e.edge.va, e.edge.vb].forEach(v => {
      minX = Math.min(v.x, minX);
      maxX = Math.max(v.x, maxX);
      minY = Math.min(v.y, minY);
      maxY = Math.max(v.y, maxY);
    });
  });
  return {x: minX | 0, y: minY | 0, width: Math.ceil(maxX - minX + 1), height: Math.ceil(maxY - minY + 1)};
};

const drawCell = (ctx: CanvasRenderingContext2D, cell: Cell, color: string = '#DDD') => {
  ctx.save();
  ctx.fillStyle = color;
  // ctx.globalAlpha = .8;
  ctx.lineWidth = 0;
  const cellPath = new Path2D();
  let edges: Halfedge[] = [...cell.halfedges];
  if (edges.length) {
    let edge: Halfedge = edges.shift() as Halfedge;
    if (edge) {
      cellPath.moveTo(edge.edge.va.x, edge.edge.va.y);
      cellPath.lineTo(edge.edge.vb.x, edge.edge.vb.y);
      while (edges.length && edge) {
        let ne = edges.find(e => samePoint(e.edge.va, edge.edge.vb) || samePoint(e.edge.vb, edge.edge.vb));
        if (ne) {
          edges = edges.filter(e => e !== ne);
          if (samePoint(ne.edge.vb, edge.edge.vb)) { const t = ne.edge.va; ne.edge.va = ne.edge.vb; ne.edge.vb = t; }
          cellPath.lineTo(ne.edge.vb.x, ne.edge.vb.y);
          edge = ne;
        } else {
          console.error('edge / edges', [edge.edge.va, edge.edge.vb], edges.map(e => [e.edge.va, e.edge.vb]));
          throw new Error('not enough edges to make a full poly');
        }
      }
    }
  }
  cellPath.closePath();
  fillCell(ctx, cell, cellPath, color);
  ctx.restore();
};

const fillCell = (ctx: CanvasRenderingContext2D, cell: Cell, cellPath: Path2D, color: string) => {
  let img = colorImg[color];
  if (!img) img = colorImg['#FFF'];
  if (!img) throw new Error('no img for cell');
  const bbox = cellBB(cell);
  const bg = generateWFC_BG(img, [bbox.width, bbox.height]);
  if (bg) {
    const c = document.createElement('canvas');
    const ctx2 = c.getContext('2d');
    if (ctx2) {
      ctx2.putImageData(bg, 0, 0);
      ctx.clip(cellPath);
      // ctx.globalAlpha = 1;
      ctx.drawImage(c, bbox.x | 0, bbox.y | 0);
    } else {
      ctx.fill(cellPath);
    }
  } else {
    ctx.fill(cellPath);
  }
};

// const cityArr = [
//   [0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0],
//   [0, 1, 1, 2, 1, 1, 1, 1, 1, 0, 3, 0],
//   [0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 3, 0],
//   [0, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 0],
//   [0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 3, 0],
//   [0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 3, 0],
//   [0, 1, 1, 2, 1, 1, 1, 1, 1, 0, 3, 0],
//   [0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 3, 0],
//   [1, 1, 0, 3, 0, 1, 1, 1, 1, 0, 3, 1],
//   [2, 1, 0, 3, 0, 1, 2, 2, 2, 3, 3, 1],
//   [2, 1, 0, 3, 0, 1, 2, 2, 1, 0, 3, 1],
//   [1, 1, 0, 3, 0, 1, 1, 1, 1, 0, 3, 1],
// ];
const cityArr = [
  [0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [0, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0, 3],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 3],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 3],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
  [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 3],
  [0, 1, 2, 1, 0, 1, 2, 2, 2, 2, 3, 3],
  [0, 1, 2, 1, 0, 1, 2, 2, 2, 1, 0, 3],
  [0, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 3],
  [0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
];
const suburbArr = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 3, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 0],
  [0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 3, 0],
  [3, 2, 2, 2, 2, 2, 2, 2, 1, 0, 3, 3],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 3, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 3, 0],
  [0, 0, 0, 0, 1, 2, 2, 2, 2, 3, 3, 0],
  [0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 3, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 3, 0],
];
const ruralArr = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 3, 0],
  [0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 3, 0],
  [0, 0, 0, 0, 1, 2, 2, 2, 2, 3, 3, 0],
  [0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 3, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 3, 0],
  [0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
];
const countryArr = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
const palette = [
  [95, 255, 95, 255],
  [66, 66, 0, 255],
  [128, 128, 0, 255],
  [192, 192, 33, 255],
  [44, 212, 44, 255],
];
const arrToImgData = (arr: number[][]) => {
  const na: number[] = [];
  for (let y = 0; y < arr[0].length; y++) {
    for (let x = 0; x < arr.length; x++) {
      const idx = arr[x]?.[y];
      let c = [255, 255, 255, 255];
      if (idx !== undefined) {
        c = palette[idx] || [255, 255, 255, 255]; // default sufficiently out of range
      }
      na.push(...c);
    }
  }
  return new ImageData(new Uint8ClampedArray(na), arr.length, arr[0].length);
};
const cityImg = arrToImgData(cityArr);
const suburbImg = arrToImgData(suburbArr);
const ruralImg = arrToImgData(ruralArr);
const countryImg = arrToImgData(countryArr);
const colorImg: {[k: string]: ImageData} = {
  '#666': cityImg,
  '#999': suburbImg,
  '#CCC': ruralImg,
  '#FFF': countryImg,
};

const generateWFC_BG = (img: ImageData, size: [number, number]) => {
  const t = new OverlappingModel(img.data, img.width, img.height, 3, size[0], size[1], true, false, 8);
  let tries = 0;
  let s = false;
  while (!s && tries < 10) {
    s = t.generate(Math.random);
    tries++;
  }
  if (s) {
    const v = t.graphics();
    if (v) {
      return new ImageData(Uint8ClampedArray.from(v), size[0], size[1]);
    }
  }
  return null;
};

export const drawVoronoi = (ctx: CanvasRenderingContext2D, diagram: Diagram) => {
  if (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ctx.strokeStyle = '#000';
    // ctx.lineWidth = .2;
    // ctx.beginPath();
    // console.log('should draw edges', diagram.edges.length);
    // diagram.edges.forEach(e => {
    //   ctx.moveTo(e.va.x, e.va.y);
    //   ctx.lineTo(e.vb.x, e.vb.y);
    // });
    // ctx.stroke();

    const abs = Math.abs;
    const roads: Vec2[][] = [];
    const roadPaths: Path2D[] = [];

    const sx = Math.random() * (ctx.canvas.width - 100) + 50;
    const ex = Math.random() * (ctx.canvas.width - 100) + 50;
    // strokeLine(ctx, {x: sx, y: 0}, {x: ex, y: ctx.canvas.height}, '#009');

    const rp1 = new Path2D();
    // const xSlope = Math.atan(ctx.canvas.height / (ex - sx));
    let p: Vec2|undefined = diagram.vertices.reduce((a, c) => c.y === 0 && abs(sx - c.x) < abs(sx - a.x) ? c : a);
    rp1.moveTo(p.x, p.y);
    const up: Vec2[] = [];
    let tries = 0;
    while (p !== undefined && p.y !== ctx.canvas.height && tries < 100) {
      const np = nextPoint(p, up, {x: sx, y: 0}, {x: ex, y: ctx.canvas.height}, diagram.edges);
      up.push(p);
      if (np) {
        rp1.lineTo(np.x, np.y);
        p = np;
      } else {
        p = undefined;
      }
      tries++;
    }
    roads.push([...up]);
    roadPaths.push(rp1);

    const sy = Math.random() * (ctx.canvas.height - 100) + 50;
    const ey = Math.random() * (ctx.canvas.height - 100) + 50;
    // strokeLine(ctx, {x: 0, y: sy}, {x: ctx.canvas.width, y: ey}, '#900');

    const rp2 = new Path2D();
    p = diagram.vertices.reduce((a, c) => c.x === 0 && abs(sy - c.y) < abs(sy - a.y) ? c : a);
    rp2.moveTo(p.x, p.y);
    up.length = 0;
    tries = 0;
    while (p !== undefined && p.x !== ctx.canvas.width && tries < 100) {
      const np = nextPoint(p, up, {x: 0, y: sy}, {x: ctx.canvas.width, y: ey}, diagram.edges);
      up.push(p);
      if (np) {
        rp2.lineTo(np.x, np.y);
        p = np;
      } else {
        p = undefined;
      }
      tries++;
    }
    ctx.stroke();
    roads.push([...up]);
    roadPaths.push(rp2);

    const cityIds: number[] = [];
    // const suburbIds: number[] = [];
    const roadIds: number[] = [];
    diagram.cells.forEach(cell => {
      const onRoads = roads.reduce((a, c) => c.some(p => cell.halfedges.some(he => samePoint(he.edge.va, p) || samePoint(he.edge.vb, p))) ? a + 1 : a, 0);
      if (onRoads === 2) {
        cityIds.push(cell.site.id);
      } else if (onRoads === 1) {
        roadIds.push(cell.site.id);
      }
    });
    diagram.cells.forEach(cell => {
      if (cityIds.find(id => id === cell.site.id)) {
        drawCell(ctx, cell, '#666');
      } else if (cell.getNeighborIds().some(sid => cityIds.find(id => id === sid))) {
        drawCell(ctx, cell, '#999');
      } else if (roadIds.find(id => id === cell.site.id)) {
        drawCell(ctx, cell, '#CCC');
      } else {
        drawCell(ctx, cell, '#6F6');
      }
    });
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(192, 192, 33)';
    // ctx.globalAlpha = .8;
    roadPaths.forEach(p => ctx.stroke(p));

  }
};

export const VoronoiUI: FC = () => {
  const [voronoiCtx, setVoronoiCtx] = useState<CanvasRenderingContext2D|undefined>(undefined);
  const [divisions, setDivisions] = useState<number>(16);
  const [redraw, setRedraw] = useState<number>(new Date().getTime());

  useEffect(() => {
    const voronoiCanvas = document.getElementById('voronoi-map') as HTMLCanvasElement;
    if (!voronoiCanvas) {
      throw new Error('could not find interaction canvas');
    }
    setVoronoiCtx(voronoiCanvas.getContext('2d') as CanvasRenderingContext2D);
  }, []);

  useEffect(() => {
    if (voronoiCtx) {
      console.log('should totally be generating');
      const pts = generatePoints(Math.random, {x: 0, y: 0}, {x: voronoiCtx.canvas.width, y: voronoiCtx.canvas.height}, () => Math.min(voronoiCtx.canvas.width, voronoiCtx.canvas.height) / divisions);
      const voronoi = new Voronoi();
      const diagram = voronoi.compute(pts.map((p, id) => ({...p, id})), {xl: 0, xr: voronoiCtx.canvas.width, yt: 0, yb: voronoiCtx.canvas.height});
      drawVoronoi(voronoiCtx, diagram);
    }
  }, [voronoiCtx, divisions, redraw]);

  return <div className={'interface'}>
    <h1>Voronoi Mapping</h1>
    Divisions: <input type={'number'} min={2} max={50} value={divisions} onChange={e => setDivisions(parseInt(e.target.value, 10))}/>
    <button style={{padding: '.25em .5em'}} onClick={() => setRedraw(new Date().getTime())}>again</button>
    <br/>
    <canvas id={'voronoi-map'} width={512} height={512} style={{background: 'white', transformOrigin: '0 0', transform: 'scale(2)'}}/>
  </div>;
};
