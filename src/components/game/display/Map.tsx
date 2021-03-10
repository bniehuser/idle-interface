import React, { FC, useEffect } from 'react';
import TileSet from '../../../../public/img/TileSet.png';
import Simulation from '../../../simulation';
import { createMap, makeMapTexture, MapPoint } from '../../../simulation/entity/map';
import {
  getMoonColor,
  getMoonDir,
  getSunColor,
  getSunDir,
  setCelestialTime,
} from '../../../simulation/system/celestial';
import { getPersonPosArray } from '../../../simulation/system/display/display.people';
import vsSource from '../../../simulation/system/display/shaders/simpleOrtho.vert';
import fsSource from '../../../simulation/system/display/shaders/tilemap.frag';
import {
  createProgram,
  createSampler,
  createShader,
  fetchGlContext,
  resizeGl,
  setTexture,
  textureFromImg,
  textureFromPixArray,
} from '../../../simulation/system/display/webgl';

export const Map: FC = () => {

  // init
  useEffect(() => {
    // load our simulation data immediately
    if (!Simulation.state.map) {
      console.log('why we no see state map?');
    }
    const map = Simulation.state.map || createMap({width: 512, height: 512});
    const pixArray = makeMapTexture(map);

    // do the stuff before we start
    const gl = fetchGlContext('experiment-canvas');

    const prg = createProgram(
      gl,
      createShader(gl, gl.VERTEX_SHADER, vsSource),
      createShader(gl, gl.FRAGMENT_SHADER, fsSource),
    );

    // this part starts to become dependent on the shader code, as it needs the attribs/uniforms
    // just the one attribute -- the screen rect to render
    const posLoc = gl.getAttribLocation(prg, 'position');
    // TODO: simplify uniform mapping and updates (plus, we absolutely don't need all these and they slow the shader down)
    const timeLoc = gl.getUniformLocation(prg, 'u_time');
    const offsLoc = gl.getUniformLocation(prg, 'u_offs');
    const scaleLoc = gl.getUniformLocation(prg, 'u_scale');
    const sunDirLoc = gl.getUniformLocation(prg, 'u_sunDirection');
    const sunColorLoc = gl.getUniformLocation(prg, 'u_sunColor');
    const moonDirLoc = gl.getUniformLocation(prg, 'u_moonDirection');
    const moonColorLoc = gl.getUniformLocation(prg, 'u_moonColor');
    const viewLoc = gl.getUniformLocation(prg, 'u_viewport');
    const mapLoc = gl.getUniformLocation(prg, 'mapPix');
    const tileLoc = gl.getUniformLocation(prg, 'tilePix');

    // create our dead-simple position buffer for a single quad
    const mapVAO = gl.createVertexArray();
    if (!mapVAO) throw new Error('could not create vertex array');
    gl.bindVertexArray(mapVAO);
    const mapPos = new Float32Array([
      // x  y  u  v
      -1, -1, 0, 1,
      1, -1, 1, 1,
      1,  1, 1, 0,

      -1, -1, 0, 1,
      1,  1, 1, 0,
      -1,  1, 0, 0,
    ]);
    const posBuf = gl.createBuffer();
    if (!posBuf) throw new Error('could not create buffer');
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, mapPos, gl.STATIC_DRAW);

    // slap it in the attribute
    gl.enableVertexAttribArray(posLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.vertexAttribPointer(
      posLoc,
      4,
      gl.FLOAT,
      false,
      0,
      0,
    );

    const pixTex = textureFromPixArray(gl, pixArray, map.width, map.height);
    const tileImg = new Image();
    tileImg.src = TileSet;
    const tileTex = textureFromImg(gl, tileImg, () => render(Simulation.state.simulationTime));
    const nearestSampler = createSampler(gl, 'nearest');

    // this could be done per-frame, but we're just using the one, so set and forget
    gl.useProgram(prg);
    // one-and-done texture load -- if using multiple programs or reassigning tex this would need done in render loop
    setTexture(gl, gl.TEXTURE0, pixTex, nearestSampler);
    setTexture(gl, gl.TEXTURE1, tileTex);

    // set initial sun/moon pos/color
    setCelestialTime(Simulation.scratch.processTime);
    gl.uniform3fv(sunColorLoc, getSunColor());
    gl.uniform3fv(sunDirLoc, getSunDir());
    gl.uniform3fv(moonColorLoc, getMoonColor());
    gl.uniform3fv(moonDirLoc, getMoonDir());

    // input handling
    // TODO: maybe move this code to simulation display system too? seems highly dependent on map processing
    let lastMouse: [number, number]|undefined = undefined;
    let offset: [number, number] = [0, 0];
    let scale: number = 1;
    const updateOffs = () => {
      const { mouse } = Simulation.scratch.input;
      if (mouse.down) {
        if (lastMouse) {
          const mouseDelta = [mouse.x - lastMouse[0], mouse.y - lastMouse[1]];
          offset = [offset[0] + mouseDelta[0], offset[1] + mouseDelta[1]];
        }
        lastMouse = [mouse.x, mouse.y];
      } else {
        // this seems wasteful.  setting undefined every frame probably isn't expensive, but it feels wrong.
        lastMouse = undefined;
      }
      if (mouse.scroll !== 0) {
        const oldscale = scale;
        const scaleDiff = mouse.scroll * .09;
        scale = Math.max(.1, Math.min(10, scale * (1 + scaleDiff)));
        const sF = scale / oldscale;
        if (oldscale !== scale) {
          // this has GOT to be SLOW AS HELL
          const frame = document.getElementById('experiment-display');
          if (frame) {
            // TODO: this is TOTALLY FLIPPING WRONG, and slow to boot
            const br = frame.getBoundingClientRect();
            const inX = (mouse.x - br.x);
            const inY = (mouse.y - br.y);
            let totx = offset[0] + inX;
            let toty = offset[1] + inY;
            console.log('old offset:', scale.toFixed(3), sF.toFixed(3), offset);
            offset[0] = totx * sF - inX / sF; // / sF;
            offset[1] = toty * sF - inY / sF; // / sF;
            console.log('new offset:', scale.toFixed(3), sF.toFixed(3), offset);
          }
        }
        mouse.scroll = 0; // poor man's reset
        console.log('setting scale', scale);
      }
    };

    // prep screen
    resizeGl('experiment-display', gl);

    // do the actual rendering
    const render = (t: number) => {
      resizeGl('experiment-display', gl); // this actually makes rendering FASTER...?!? layout runs during frame cycle instead of over a larger span outside it
      gl.clear(gl.COLOR_BUFFER_BIT);
      // note: t is in simulation time; whatever the current date is in the simulation
      gl.uniform1f(timeLoc, t / 1000000);
      gl.uniform2f(offsLoc, offset[0], offset[1]);
      gl.uniform1f(scaleLoc, scale);
      gl.uniform2f(viewLoc, gl.canvas.width, gl.canvas.height);

      // sun and moon  colors should never change so we can skip those
      setCelestialTime(Simulation.scratch.processTime);
      gl.uniform3fv(sunDirLoc, getSunDir());
      gl.uniform3fv(moonDirLoc, getMoonDir());

      // set map texture sampler to texture0
      gl.uniform1i(mapLoc, 0);
      gl.uniform1i(tileLoc, 1);
      // draw it
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    // render now (why not?)
    render(Simulation.state.simulationTime);

    // this should be elsewhere
    // Simulation.state.DEBUG = true;

    const times: number[] = [];
    let fps: number = 0;
    const fpsCont = document.getElementById('fps');
    if (!fpsCont) throw new Error('could not find fps container');

    const updateFps = () => {
      const now = performance.now();
      while (times.length > 0 && times[0] <= now - 1000) {
        times.shift();
      }
      times.push(now);
      fps = times.length;
      fpsCont.innerText = fps + '';
    };

    const inBox = (p: MapPoint, box: [number, number, number, number]) => p.x >= box[0] && p.y >= box[1] && p.x <= box[2] && p.y <= box[3];

    const worldBox = (): [number, number, number, number] => {
      const lx = (-offset[0] * scale) / map.tileSize - 1; // minus one tile for things overlapping screen
      const ly = (-offset[1] * scale) / map.tileSize - 1;
      const hx = lx + (gl.canvas.width * scale) / map.tileSize + 1;
      const hy = ly + (gl.canvas.height * scale) / map.tileSize + 1;
      return [lx, ly, hx, hy];
    };

    // this absolutely does not belong here
    const getPeopleArray = () => {
      const vertices: number[] = [];
      const box = worldBox();
      // if (!((performance.now() | 0) % 10)) console.log(box);
      Simulation.state.people.living.forEach(id => {
        const p = Simulation.state.people.all[id];
        if (inBox(p.location, box)) {
          vertices.push(...getPersonPosArray(p));
        }
      });
      // if (!((performance.now() | 0) % 10)) console.log(vertices);
      // console.log('visible people:', vertices.length / 24);
    };

    // per frame
    const experiment = (t: number) => {
      if (Simulation.state.DEBUG) {
        updateFps();
      }
      updateOffs();
      getPeopleArray();
      render(t);
    };

    // frame subscription
    Simulation.subscribe(experiment);
    return () => Simulation.unsubscribe(experiment);
  }, []);

  return <div id={'experiment-display'}>
    <canvas id={'experiment-canvas'}/>
    <div id={'debug'} style={{position: 'absolute', top: 5, left: 5, background: 'rgba(0,0,0,.5)'}}>
      <div id={'fps'}/>
      <div id={'sun'}/>
    </div>
  </div>;
};
