import backgroundFS from './shaders/background.frag';
import backgroundVS from './shaders/background.vert';
import imageFS from './shaders/image.frag';
import imageVS from './shaders/image.vert';

export interface GLContext {
  ctx: WebGL2RenderingContext;
  drawImage: (img: TexImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number) => void;
  shaders: {[k: string]: GLShader};
  quadVertBuffer: WebGLBuffer|null;
  init: () => void;
}

export interface GLShader {
  gl: WebGL2RenderingContext;
  attributes: {[k: string]: any};
  uniformBuffer: WebGLBuffer;
  program: WebGLProgram;
}

export const createGLContext = (canvas: HTMLCanvasElement): GLContext => {
  const ctx = canvas.getContext('webgl2');
  if (ctx == null) {
    throw new Error('unable to get ctx');
  }
  const shaders: {[k: string]: GLShader} = {};
  let quadVertBuffer: null|WebGLBuffer = null;
  const terminateGL = () => {
    // do something
    Object.keys(shaders).forEach(s => {
      ctx.deleteProgram(shaders[s].program);
      delete shaders[s];
    });
    if (quadVertBuffer) {
      ctx.deleteBuffer(quadVertBuffer);
      quadVertBuffer = null;
    }
  };
  const quadVerts = new Float32Array([
    // x  y  u  v
    -1, -1, 0, 1,
    1, -1, 1, 1,
    1,  1, 1, 0,

    -1, -1, 0, 1,
    1,  1, 1, 0,
    -1,  1, 0, 0,
  ]);

  return {
    ctx,
    shaders,
    quadVertBuffer,
    drawImage: () => {},
    init: () => {
      terminateGL();

      quadVertBuffer = ctx.createBuffer();
      if (!quadVertBuffer) throw new Error('could not create quadVertBuffer buffer.');
      ctx.bindBuffer(ctx.ARRAY_BUFFER, quadVertBuffer);
      ctx.bufferData(ctx.ARRAY_BUFFER, quadVerts, ctx.STATIC_DRAW);

      const uniformBuffer = ctx.createBuffer();
      if (!uniformBuffer) throw new Error('could not create uniform buffer.');

      const bg = createGLShader(ctx, backgroundVS, backgroundFS);
      // Object.keys(bg.uniforms).forEach(k => {
      //   uniformBuffer
      // });
      shaders['background'] = {gl: ctx, program: bg.program, attributes: bg.attrib, uniformBuffer};
      shaders['image'] = {gl: ctx, program: createGLShader(ctx, imageVS, imageFS), attributes: {}, uniformBuffer};
    },
  };
};

export const createGLShader = (gl: WebGL2RenderingContext, vertSource: string, fragSource: string, attribLocations?: {[k: string]: number}) => {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);
  const program = gl.createProgram();
  if (!program) throw new Error('could not create webgl program.');
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  if (attribLocations) {
    Object.keys(attribLocations).forEach(k => {
      if (attribLocations[k]) {
        gl.bindAttribLocation(program, attribLocations[k], k);
      }
    });
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const err = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    throw new Error(`failed to link shader program:\n${err}`);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  // now we set some stuff
  const numA = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  const attrib: {[k: string]: number} = {};
  for (let i = 0; i < numA; ++i) {
    const a = gl.getActiveAttrib(program, i);
    if (a) { attrib[a.name] = gl.getAttribLocation(program, a.name); }
  }

  const numU = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  const uniforms: {[k: string]: WebGLUniformLocation} = {};
  for (let i = 0; i < numU; ++i) {
    const u = gl.getActiveUniform(program, i);
    if (u) {
      const un = u.name.replace('[0]', '');
      const l = gl.getUniformLocation(program, un);
      if (l) { uniforms[u.name] = l; }
    }
  }

  return { program, attrib, uniforms };
};

export const compileShader = (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('could not creat shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader failed to compile:\n${err}`);
  }
  return shader;
};

// export const createTexture = (gl: WebGL2RenderingContext, img: TexImageSource): WebGLTexture => {
//   const t = gl.createTexture();
//   if (!t) throw new Error('could not create texture!');
//   // set texture settings prior to actually generating texture
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//   return t;
// };
