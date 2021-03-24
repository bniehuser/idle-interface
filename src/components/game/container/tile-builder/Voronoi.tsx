import React, { FC, useEffect, useState } from 'react';
import { Diagram, Voronoi } from 'voronoijs';
import { generatePoints } from '../../../../util/geometry/poisson';

type Vec2 = { x: number, y: number };

const samePoint = (a: Vec2, b: Vec2) => {
  return a.x === b.x && a.y === b.y;
};

const sameLine = (a: { va: Vec2, vb: Vec2 }, b: { va: Vec2, vb: Vec2 }) => {
  return (samePoint(a.va, b.va) && samePoint(a.vb, b.vb)) || (samePoint(a.va, b.vb) && samePoint(a.vb, b.va));
};

const lineSlope = (b: Vec2, e: Vec2) => {
  return (e.y - b.y) / (e.x - b.x);
};

const drawVoronoi = (ctx: CanvasRenderingContext2D, diagram: Diagram) => {
  if (ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = .2;
    ctx.beginPath();
    console.log('should draw edges', diagram.edges.length);
    diagram.edges.forEach(e => {
      ctx.moveTo(e.va.x, e.va.y);
      ctx.lineTo(e.vb.x, e.vb.y);
    });
    ctx.stroke();
    ctx.strokeStyle = '#00F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // find yer lines
    ctx.stroke();
  }
};

export const VoronoiUI: FC = () => {
  const [voronoiCtx, setVoronoiCtx] = useState<CanvasRenderingContext2D|undefined>(undefined);
  const [divisions, setDivisions] = useState<number>(20);

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
  }, [voronoiCtx, divisions]);

  return <div className={'interface'}>
    <h1>Voronoi Mapping</h1>
    Divisions: <input type={'number'} min={2} max={50} value={divisions} onChange={e => setDivisions(parseInt(e.target.value, 10))}/><br/>
    <canvas id={'voronoi-map'} width={512} height={512} style={{background: 'white'}}/>
  </div>;
};
