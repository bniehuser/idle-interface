import React, { FC, memo, useEffect } from 'react';
import TileSet from '../../../../public/img/TileSet.png';
import Simulation from '../../../simulation';
import { makeMapTexture, MapPoint } from '../../../simulation/entity/map';
import { calcAvatarProps } from '../../../simulation/entity/person';
import { getPersonScratch } from '../../../simulation/scratch';
import {
  getMoonColor,
  getMoonDir,
  getSunColor,
  getSunDir,
  setCelestialTime,
} from '../../../simulation/system/celestial';
import { getPersonPosArray, setPersonTexSize } from '../../../simulation/system/display/display.people';
import { initEmojiSpriteBuffer, spriteOffs } from '../../../simulation/system/display/emojiSprites';
import vsSource from '../../../simulation/system/display/shaders/simpleOrtho.vert';
import fsSource2 from '../../../simulation/system/display/shaders/sprites.frag';
import vsSource2 from '../../../simulation/system/display/shaders/sprites.vert';
import fsSource from '../../../simulation/system/display/shaders/tilemap.frag';
import {
  createProgram,
  createSampler,
  createShader,
  fetchGlContext,
  resizeGl,
  setTexture,
  textureFromCanvas,
  textureFromImg,
  textureFromPixArray,
} from '../../../simulation/system/display/webgl';

const bindAndLoadBuffer = (gl: WebGL2RenderingContext, vao: WebGLVertexArrayObject, buf: WebGLBuffer, data: Float32Array) => {
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
};

export const Map: FC = memo(() => {

  // init
  useEffect(() => {
    // manage input controls
    let HANDLE_INPUT: boolean = false;
    (document.getElementById('experiment-display') as HTMLDivElement).addEventListener('mouseenter', () => HANDLE_INPUT = true);
    (document.getElementById('experiment-display') as HTMLDivElement).addEventListener('mouseleave', () => HANDLE_INPUT = false);

    // load our simulation data immediately
    if (!Simulation.state.map) {
      console.log('why we no see state map?');
    }
    const map = Simulation.state.map; // || createMap(Simulation.scratch, {width: 512, height: 512});
    if (!map) {
      throw new Error('no map.');
    }
    const pixArray = makeMapTexture(map);

    // do the stuff before we start
    const gl = fetchGlContext('experiment-canvas');

    const prg = createProgram(
      gl,
      createShader(gl, gl.VERTEX_SHADER, vsSource),
      createShader(gl, gl.FRAGMENT_SHADER, fsSource),
    );
    const sprg = createProgram(
      gl,
      createShader(gl, gl.VERTEX_SHADER, vsSource2),
      createShader(gl, gl.FRAGMENT_SHADER, fsSource2),
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
    const spriteLoc = gl.getUniformLocation(prg, 'spritePix');

    const posLoc2 = gl.getAttribLocation(sprg, 'position');

    const timeLoc2 = gl.getUniformLocation(sprg, 'u_time');
    const offsLoc2 = gl.getUniformLocation(sprg, 'u_offs');
    const scaleLoc2 = gl.getUniformLocation(sprg, 'u_scale');
    const sunDirLoc2 = gl.getUniformLocation(sprg, 'u_sunDirection');
    const sunColorLoc2 = gl.getUniformLocation(sprg, 'u_sunColor');
    const moonDirLoc2 = gl.getUniformLocation(sprg, 'u_moonDirection');
    const moonColorLoc2 = gl.getUniformLocation(sprg, 'u_moonColor');
    const viewLoc2 = gl.getUniformLocation(sprg, 'u_viewport');
    const mapLoc2 = gl.getUniformLocation(sprg, 'mapPix');
    const tileLoc2 = gl.getUniformLocation(sprg, 'tilePix');
    const spriteLoc2 = gl.getUniformLocation(sprg, 'spritePix');

    // create our dead-simple position buffer for a single quad
    const mapVAO = gl.createVertexArray();
    if (!mapVAO) throw new Error('could not create map vertex array');
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
    bindAndLoadBuffer(gl, mapVAO, posBuf, mapPos); // this should only need done once, or every time we switch programs?

    const spriteVAO = gl.createVertexArray();
    if (!spriteVAO) throw new Error('could not create sprite vertex array');
    const spriteBuf = gl.createBuffer();
    if (!spriteBuf) throw new Error('could not create sprite buffer');

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
    const spriteImg = initEmojiSpriteBuffer();
    const spriteTex = textureFromCanvas(gl, spriteImg);
    setPersonTexSize(32 / spriteImg.width, 32 / spriteImg.height);
    const nearestSampler = createSampler(gl, 'nearest');

    // this could be done per-frame, but we're just using the one, so set and forget
    gl.useProgram(prg);
    // one-and-done texture load -- if using multiple programs or reassigning tex this would need done in render loop
    setTexture(gl, gl.TEXTURE0, pixTex, nearestSampler);
    setTexture(gl, gl.TEXTURE1, spriteTex);
    setTexture(gl, gl.TEXTURE2, tileTex);

    // set initial sun/moon pos/color
    setCelestialTime(Simulation.scratch.processTime);
    gl.uniform3fv(sunColorLoc, getSunColor());
    gl.uniform3fv(sunDirLoc, getSunDir());
    gl.uniform3fv(moonColorLoc, getMoonColor());
    gl.uniform3fv(moonDirLoc, getMoonDir());

    gl.useProgram(sprg);
    // one-and-done texture load -- if using multiple programs or reassigning tex this would need done in render loop
    setTexture(gl, gl.TEXTURE0, pixTex, nearestSampler);
    setTexture(gl, gl.TEXTURE1, spriteTex);
    setTexture(gl, gl.TEXTURE2, tileTex);

    // set initial sun/moon pos/color
    gl.uniform3fv(sunColorLoc2, getSunColor());
    gl.uniform3fv(sunDirLoc2, getSunDir());
    gl.uniform3fv(moonColorLoc2, getMoonColor());
    gl.uniform3fv(moonDirLoc2, getMoonDir());

    gl.useProgram(prg);

    // input handling
    // TODO: maybe move this code to simulation display system too? seems highly dependent on map processing
    let br = (gl.canvas as HTMLCanvasElement).getBoundingClientRect();
    let lastMouse: [number, number]|undefined = undefined;
    let scale: number = 5;
    let offset: [number, number] = [((-map.width / 2) + br.width / 2) * scale, ((-map.height / 2) + br.height / 2) * scale];
    let oldscale: number = 1;
    let changedOffset: boolean = false;
    const updateOffs = () => {
      if (HANDLE_INPUT) {
        const {mouse} = Simulation.scratch.input;
        worldMouse.x = (((mouse.x - br.left - offset[0]) * scale) / 32);
        worldMouse.y = (((mouse.y - br.top - offset[1]) * scale) / 32);
        (document.getElementById('fps') as HTMLDivElement).innerText = `${JSON.stringify(worldMouse)}`;
        if (mouse.down) {
          if (lastMouse) {
            const mouseDelta = [mouse.x - lastMouse[0], mouse.y - lastMouse[1]];
            offset = [offset[0] + mouseDelta[0], offset[1] + mouseDelta[1]];
            changedOffset = true;
          }
          lastMouse = [mouse.x, mouse.y];
        } else {
          // this seems wasteful.  setting undefined every frame probably isn't expensive, but it feels wrong.
          lastMouse = undefined;
        }
        if (mouse.scroll !== 0) {
          const oldscale = scale;
          const scaleDiff = mouse.scroll * .09;
          scale = Math.max(.1, Math.min(20, scale * (1 + scaleDiff)));
          if (oldscale !== scale) {
            offset[0] = -1 * (((worldMouse.x * 32) / scale) - mouse.x + br.left);
            offset[1] = -1 * (((worldMouse.y * 32) / scale) - mouse.y + br.top);
            changedOffset = true;
          }
          // TODO: make this smarter.  should not be directly modified here in case anything else wants to use it
          mouse.scroll = 0; // poor man's reset
        }
      }
    };

    // prep screen
    resizeGl('experiment-display', gl);

    let spriteVertices: number[] = [];

    const inBox = (p: MapPoint, box: [number, number, number, number]) => p.x >= box[0] && p.y >= box[1] && p.x <= box[2] && p.y <= box[3];

    const worldBox = (): [number, number, number, number] => {
      const lx = (-offset[0] * scale) / map.tileSize - 1; // minus one tile for things overlapping screen
      const ly = (-offset[1] * scale) / map.tileSize - 1;
      const hx = lx + (gl.canvas.width * scale) / map.tileSize + 1;
      const hy = ly + (gl.canvas.height * scale) / map.tileSize + 1;
      return [lx, ly, hx, hy];
    };

    const worldMouse = {
      x: 0,
      y: 0,
    };

    // this absolutely does not belong here
    let setByMe: boolean = false;
    const getPeopleArray = () => {
      spriteVertices = [];
      const box = worldBox();
      // if (!((performance.now() | 0) % 10)) console.log(box);
      let hovered: number|undefined = setByMe  ? undefined : Simulation.scratch.hoveredPerson;
      Simulation.state.people.living.forEach(id => {
        const p = Simulation.state.people.all[id];
        const ps = getPersonScratch(Simulation.scratch, p.id);
        if (ps.movement.moving && ps.movement.path[0]) {
          const ms = ps.movement.speed * ((Simulation.scratch.processTime - Simulation.scratch.lastSimulationTime) / 100000);
          const toNext = [ps.movement.path[0].x - p.location.x, ps.movement.path[0].y - p.location.y];
          const dist = Math.sqrt(toNext[0] * toNext[0] + toNext[1] * toNext[1]);
          if (dist < ms) {
            p.location.x = ps.movement.path[0].x;
            p.location.y = ps.movement.path[0].y;
            ps.movement.path.shift();
          } else {
            const direction = [toNext[0] / dist, toNext[1] / dist];
            p.location.x += ms * direction[0];
            p.location.y += ms * direction[1];
          }
        }
        if (inBox(p.location, box)) {
          spriteVertices.push(...getPersonPosArray(p, spriteOffs(...calcAvatarProps(p.gender, p.skinTone, p.age))));
          if (!ps.marker) {
            ps.marker = document.createElement('div');
            ps.marker.id = 'marker_' + p.id;
            ps.marker.className = 'personMarker ' + (ps.interacting ? 'speech' : '');
            ps.marker.innerText = p.avatar;
            ps.marker.style.fontSize = (32 / scale) + 'px';
            ps.marker.style.width = (32 / scale) + 'px';
            ps.marker.style.height = (32 / scale) + 'px';
            ps.marker.style.top = ((p.location.y * 32 / scale + offset[1])) + 'px';
            ps.marker.style.left = ((p.location.x * 32 / scale + offset[0])) + 'px';
            // OHS NOES -- scratch is no longer serializable.
            (document.getElementById('experiment-display') as HTMLDivElement).appendChild(ps.marker);
          } else {
            const mn = 'personMarker ' + (ps.interacting ? 'speech' : '');
            if (mn !== ps.marker.className) { // worth checking, changing dom className prompts dom style assessment even if its the same
              ps.marker.className = mn;
            }
            if (scale !== oldscale || changedOffset || ps.movement.moving) {
              if (scale !== oldscale) {
                ps.marker.style.fontSize = (32 / scale) + 'px';
                ps.marker.style.width = (32 / scale) + 'px';
                ps.marker.style.height = (32 / scale) + 'px';
              }
              ps.marker.style.top = ((p.location.y * 32 / scale + offset[1])) + 'px';
              ps.marker.style.left = ((p.location.x * 32 / scale + offset[0])) + 'px';
            }
          }
          if (p.location.x <= worldMouse.x && worldMouse.x <= p.location.x + 1 && p.location.y <= worldMouse.y && worldMouse.y <= p.location.y + 1) {
            // console.log('should hover person ', p.id, worldMouse);
            hovered = p.id;
            setByMe = true;
          }
        } else {
          if (ps.marker) {
            (ps.marker.parentElement as HTMLDivElement).removeChild(ps.marker);
            ps.marker = undefined;
          }
        }
      });
      oldscale = scale;
      changedOffset = false;
      if (hovered || (setByMe && !hovered)) {
        if (!hovered) setByMe = false;
        Simulation.scratch.hoveredPerson = hovered;
      }
      // if (!((performance.now() | 0) % 10)) console.log(vertices);
      // console.log('visible people:', vertices.length / 24);
    };

    let RESIZED: boolean = false;
    ((gl.canvas as HTMLCanvasElement).parentElement as HTMLDivElement).addEventListener('resize', () => RESIZED = true);
    window.addEventListener('resize', () => RESIZED = true);
    // do the actual rendering
    const render = (t: number) => {
      if (RESIZED) {
        resizeGl('experiment-display', gl); // this actually makes rendering FASTER...?!? layout runs during frame cycle instead of over a larger span outside it
        br = (gl.canvas as HTMLCanvasElement).getBoundingClientRect();
        RESIZED = false;
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prg);

      bindAndLoadBuffer(gl, mapVAO, posBuf, mapPos);

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

      // note: t is in simulation time; whatever the current date is in the simulation
      gl.uniform1f(timeLoc, t / 1000000);
      gl.uniform2f(offsLoc, offset[0], offset[1]);
      gl.uniform1f(scaleLoc, scale);
      gl.uniform2f(viewLoc, gl.canvas.width, gl.canvas.height);

      // sun and moon  colors should never change so we can skip those
      setCelestialTime(Simulation.scratch.processTime);
      const sunDir = getSunDir();
      const moonDir = getMoonDir();
      gl.uniform3fv(sunDirLoc, sunDir);
      gl.uniform3fv(moonDirLoc, moonDir);

      // set map texture sampler to texture0
      gl.uniform1i(mapLoc, 0);
      gl.uniform1i(spriteLoc, 1);
      gl.uniform1i(tileLoc, 2);
      // draw it
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // do it all again for the people?
      if (spriteVertices && spriteVertices.length) {
        // console.log('sb drawing?', spriteVertices.length / 6);
        gl.useProgram(sprg);

        gl.uniform1f(timeLoc2, t / 1000000);
        gl.uniform2f(offsLoc2, offset[0], offset[1]);
        gl.uniform1f(scaleLoc2, scale);
        gl.uniform2f(viewLoc2, gl.canvas.width, gl.canvas.height);

        // sun and moon  colors should never change so we can skip those
        gl.uniform3fv(sunDirLoc2, sunDir);
        gl.uniform3fv(moonDirLoc2, moonDir);

        // set map texture sampler to texture0
        gl.uniform1i(mapLoc2, 0);
        gl.uniform1i(spriteLoc2, 1);
        gl.uniform1i(tileLoc2, 2);

        gl.enableVertexAttribArray(posLoc2);
        const sv = new Float32Array(spriteVertices);
        const svBuf = gl.createBuffer();
        if (!svBuf) throw new Error('could not make svBuf');

        bindAndLoadBuffer(gl, spriteVAO, svBuf, sv);

        gl.bindBuffer(gl.ARRAY_BUFFER, svBuf);
        gl.vertexAttribPointer(
          posLoc2,
          4,
          gl.FLOAT,
          false,
          0,
          0,
        );

        gl.drawArrays(gl.TRIANGLES, 0, spriteVertices.length / 4);
      }
    };

    // render now (why not?)
    getPeopleArray();
    render(Simulation.state.simulationTime);

    // const ed = document.getElementById('experiment-display');
    // if (ed && Simulation.state.map) {
    //   const getT = makeTileFinder(Simulation.state.map);
    //   for (let x = -10; x < 11; x++) {
    //     for (let y = -10; y < 11; y++) {
    //       const t = getT(256+x, 256+y);
    //       if (t && t.type === 3) {
    //         const dot = document.createElement('div');
    //         dot.style.position = 'absolute';
    //         dot.style.borderRadius = '50%';
    //         dot.style.background = 'blue';
    //         dot.style.width = (32 / scale) + 'px';
    //         dot.style.height = (32 / scale) + 'px';
    //         dot.style.top = (((256+y) * 32 / scale + offset[1])) + 'px';
    //         dot.style.left = (((256+x) * 32 / scale + offset[0])) + 'px';
    //         console.log('creating dot', dot.style.top, dot.style.left);
    //         ed.appendChild(dot);
    //       }
    //     }
    //   }
    // }

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
});
