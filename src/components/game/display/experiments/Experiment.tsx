import React, { FC, useEffect } from 'react';
import Suncalc from 'suncalc';
import TileSet from '../../../../../public/img/TileSet.png';
import Simulation from '../../../../simulation';
import { createMap, makeMapTexture } from '../../../../simulation/entity/map';
import { DAY, HOUR } from '../../../../util/const/time';

const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const s = gl.createShader(type);
  if (!s) throw new Error('could not create shader');
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) || 'could not compile: no log info available');
  }
  return s;
};

const createProgram = (gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader, detach: boolean = false) => {
  const prg = gl.createProgram();
  if (!prg) throw new Error('could not create shader program.');
  gl.attachShader(prg, vs);
  gl.attachShader(prg, fs);
  gl.linkProgram(prg);
  if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prg) || 'could not link: no link error');
  }
  if (detach) {
    gl.detachShader(prg, vs);
    gl.deleteShader(vs);
    gl.detachShader(prg, fs);
    gl.deleteShader(fs);
  }
  return prg;
};

const textureFromPixArray = (gl: WebGL2RenderingContext, pixArray: Uint8Array, width: number, height: number) => {
  const pixTex = gl.createTexture();
  if (!pixTex) throw new Error('could not create texture');
  gl.bindTexture(gl.TEXTURE_2D, pixTex);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixArray,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return pixTex;
};

const textureFromImg = (gl: WebGL2RenderingContext, img: HTMLImageElement, cb: (() => void)|undefined = undefined) => {
  const pixTex = gl.createTexture();
  if (!pixTex) throw new Error('could not create texture');
  img.addEventListener('load', () => {
    gl.bindTexture(gl.TEXTURE_2D, pixTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (cb) cb();
  });
  return pixTex;
};

type TempSamplerType = 'nearest'; // this should be a union type of acceptable sampler types
const createSampler = (gl: WebGL2RenderingContext, samplerType: TempSamplerType) => {
  switch (samplerType) {
    case 'nearest':
    default:
      const nearestSampler = gl.createSampler();
      if (!nearestSampler) throw new Error('could not create sampler');
      gl.samplerParameteri(nearestSampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.samplerParameteri(nearestSampler, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      return nearestSampler;
  }
};

const setTexture = (gl: WebGL2RenderingContext, pos: number, tex: WebGLTexture, sam: WebGLSampler|undefined = undefined) => {
  gl.activeTexture(pos);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  if (sam) {
    gl.bindSampler(gl.TEXTURE0, sam);
  }
};

// const normalize2d = (x: number, y: number): [number, number] => {
//   const m = Math.sqrt(x * x + y * y);
//   return [x / m, y / m];
// };
const normalize3d = (x: number, y: number, z: number): [number, number, number] => {
  const m = Math.sqrt(x * x + y * y + z * z);
  return [x / m, y / m, z / m];
};

export const Experiment: FC = () => {

  // init
  useEffect(() => {
    // do the stuff before we start
    const glCanvas = (document.getElementById('experiment-canvas') as HTMLCanvasElement);
    if (!glCanvas) throw new Error('no canvas for you');
    const gl = glCanvas.getContext('webgl2');
    if (!gl) throw new Error('no webgl2 context for you');
    // const glContext = createGLContext(glCanvas);
    // naw, let's build it from scratch.

    const vsSource = `#version 300 es
    in vec4 position;
    out vec2 texPos;

    void main() {
      gl_Position = vec4(position.x, position.y, 1, 1);
      texPos = position.zw;
    }
    `;
    const fsSource = `#version 300 es
    precision highp float;
    in vec2 texPos;

    uniform float u_time;
    uniform vec2 u_offs;
    uniform float u_scale;
    uniform vec2 u_viewport;
    uniform vec3 u_sunDirection;
    uniform vec3 u_sunColor;
    uniform sampler2D mapPix;
    uniform sampler2D tilePix;

    out vec4 outColor;

    vec3 sunLight(const vec3 surfaceNormal, const vec3 eyeNormal, float shiny, float spec, float diffuse){
      vec3 diffuseColor = max(dot(u_sunDirection, surfaceNormal),0.0)*u_sunColor*diffuse;
      vec3 reflection = normalize(reflect(-u_sunDirection, surfaceNormal));
      float direction = max(0.0, dot(eyeNormal, reflection));
      vec3 specular = pow(direction, shiny)*u_sunColor*spec;
      return diffuseColor + specular;
    }

    void main() {
      vec2 newPos = texPos;
      // probably unnecessary
      float x = newPos.x + sin(fract(u_time))*.5;
      float y = newPos.y + sin(fract(u_time))*.5;

      // pixel pos in 'world space'
      vec2 posP = u_scale * (vec2(x, y) * u_viewport - u_offs);
      // tilemap pos (div by tile size)
      vec2 uv = posP / 32.;
      // overstep amount within tile
      vec2 tileOS = floor(mod(posP,32.));

      // ignore if off map
      if(uv.x > 512. || uv.x < 0.) discard;
      if(uv.y > 512. || uv.y < 0.) discard;

      // fract representation of map location, get map lookup pixel
      vec2 uvP = uv/512.;
      vec4 tileData = texture(mapPix, uvP);
      // convert frac value of color back to pixel value
      vec2 tileDP = floor(tileData.rg * 255.);

      // get pixel pos in tilemap, convert to frac for uv map
      vec2 tileL = tileDP + tileOS;
      vec4 tileP = texture(tilePix, tileL/vec2(384., 512.));

      // calc eyeball normal to pixel assuming 1 unit distance
      vec3 eyeNormal = normalize(vec3(newPos - .5, 0.) - vec3(0.,0.,-1.));
      // get sunlight
      vec4 sl = vec4(sunLight(normalize(vec3(0., 0., -1)), eyeNormal, 15., 2.5 , 1.), 1.); // orig 15., 2.5, 1.

      sl = u_sunDirection.z > 0. ? vec4(0., 0., 0., 1.) : sl;

      // apply sunlight to tile pixel and return
      outColor = tileP * .2 + tileP * sl;

      vec2 scrP = (newPos*2.-1.);
      if(abs(scrP.x) < .001 || abs(scrP.y) < .001) {
        outColor = vec4(1.,0.,0.,1.);
      }
      vec3 sdOffs = u_sunDirection;
      // sdOffs.z += 1.;
      if(length(sdOffs.xz - scrP) < .01) {
        outColor = vec4(u_sunColor, 1);
      }
    }
    `;
    const prg = createProgram(
      gl,
      createShader(gl, gl.VERTEX_SHADER, vsSource),
      createShader(gl, gl.FRAGMENT_SHADER, fsSource),
    );
    // this part starts to become dependent on the shader code, as it needs the attribs/uniforms
    const posLoc = gl.getAttribLocation(prg, 'position');
    const timeLoc = gl.getUniformLocation(prg, 'u_time');
    const offsLoc = gl.getUniformLocation(prg, 'u_offs');
    const scaleLoc = gl.getUniformLocation(prg, 'u_scale');
    const sunDirLoc = gl.getUniformLocation(prg, 'u_sunDirection');
    const sunColorLoc = gl.getUniformLocation(prg, 'u_sunColor');
    const viewLoc = gl.getUniformLocation(prg, 'u_viewport');
    const mapLoc = gl.getUniformLocation(prg, 'mapPix');
    const tileLoc = gl.getUniformLocation(prg, 'tilePix');

    // create our position buffer
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
    gl.bufferData(gl.ARRAY_BUFFER, mapPos, gl.STATIC_DRAW); // still unclear exactly what this does

    // should this stuff be per-frame?

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

    const resizeGl = () => {
      const frame = document.getElementById('experiment-display');
      if (frame) {
        const br = frame.getBoundingClientRect();
        gl.canvas.width = br.right - br.left;
        gl.canvas.height = br.bottom - br.top;
        // no really, one day we will render here
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      }
    };
    resizeGl();

    gl.useProgram(prg);

    const map = createMap({width: 512, height: 512});
    const pixArray = makeMapTexture(map);
    const pixTex = textureFromPixArray(gl, pixArray, map.width, map.height);
    const tileImg = new Image();
    tileImg.src = TileSet;
    const tileTex = textureFromImg(gl, tileImg, () => render(Simulation.state.gameTime));
    const nearestSampler = createSampler(gl, 'nearest');

    // one-and-done texture load -- if using multiple programs or reassigning tex this would need done in render loop
    setTexture(gl, gl.TEXTURE0, pixTex, nearestSampler);
    setTexture(gl, gl.TEXTURE1, tileTex);

    // okay, let's get really wacky
    const sunScale = 1;
    const sunColor = [1.6 * sunScale, 1.47 * sunScale, 1.29 * sunScale];
    const sunDirection: [number, number, number] = [0.0, 2.5, 15.0]; //
    gl.uniform3fv(sunColorLoc, sunColor);
    gl.uniform3fv(sunDirLoc, normalize3d(...sunDirection));

    // input handling
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

    const sunDist = 1;

    const sunTime = new Date();
    const getSunDir = () => {
      sunTime.setTime(Simulation.scratch.processTime);
      const sunPos = Suncalc.getPosition(sunTime, 38.4404, -122.7141);
      // if (Simulation.state.DEBUG) {
      //   (document.getElementById('sun') as HTMLDivElement).innerHTML = `<pre>${JSON.stringify(sunPos, null, '  ')}</pre>`;
      // }
      return [
        Math.cos(sunPos.altitude) * Math.sin(sunPos.azimuth) * sunDist,
        Math.cos(sunPos.altitude) * Math.cos(sunPos.azimuth) * sunDist,
        -Math.sin(sunPos.altitude) * sunDist, // flip z axis to respect view orientation
      ];
    };

    const getSunColor = () => {
      return [1.6 * sunScale, 1.47 * sunScale, 1.29 * sunScale]; // was assigned to 'defaultColor'
      // let m = 1; // color multiplier, just in case
      // return [defaultColor[0] * m, defaultColor[1] * m, defaultColor[2] * m];
      // return defaultColor;
    };

    Simulation.subscribe(() => {
      const sunPos = Suncalc.getPosition(new Date(Simulation.scratch.processTime), 38.4404, -122.7141);
      const sunDir = getSunDir();
      console.log('SUN POS', sunPos, sunDir);
      // console.log('SUN DIRECTION', getSunDir().map(v => v.toFixed(4)), Simulation.scratch.processTime);
    }, HOUR);

    Simulation.subscribe(() => {
      const sunTimes = Suncalc.getTimes(new Date(Simulation.scratch.processTime), 38.4404, -122.7141);
        console.log('SUN TIMES', sunTimes);
    }, DAY);

    const render = (t: number) => {
      resizeGl(); // this actually makes rendering FASTER...?!? layout runs during frame cycle instead of over a larger span outside it
      gl.clear(gl.COLOR_BUFFER_BIT);
      // note: t is in simulation time; whatever the current date is in the simulation
      gl.uniform1f(timeLoc, t / 1000000);
      gl.uniform2f(offsLoc, offset[0], offset[1]);
      gl.uniform1f(scaleLoc, scale);
      gl.uniform3fv(sunDirLoc, getSunDir());
      gl.uniform3fv(sunColorLoc, getSunColor());
      gl.uniform2f(viewLoc, gl.canvas.width, gl.canvas.height);
      // set map texture sampler to texture0
      gl.uniform1i(mapLoc, 0);
      gl.uniform1i(tileLoc, 1);
      // draw it
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    render(Simulation.state.gameTime);

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
