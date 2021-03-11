// a bunch of webgl2 shorthand

export const createShader = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const s = gl.createShader(type);
  if (!s) throw new Error('could not create shader');
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) || 'could not compile: no log info available');
  }
  return s;
};

export const createProgram = (gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader, detach: boolean = false) => {
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

export const textureFromPixArray = (gl: WebGL2RenderingContext, pixArray: Uint8Array, width: number, height: number) => {
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

export const textureFromImg = (gl: WebGL2RenderingContext, img: HTMLImageElement, cb: (() => void)|undefined = undefined) => {
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

export const textureFromCanvas = (gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) => {
  const pixTex = gl.createTexture();
  if (!pixTex) throw new Error('could not create texture');
  gl.bindTexture(gl.TEXTURE_2D, pixTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return pixTex;
};

type TempSamplerType = 'nearest'; // this should be a union type of acceptable sampler types
export const createSampler = (gl: WebGL2RenderingContext, samplerType: TempSamplerType) => {
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

export const setTexture = (gl: WebGL2RenderingContext, pos: number, tex: WebGLTexture, sam: WebGLSampler|undefined = undefined) => {
  gl.activeTexture(pos);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  if (sam) {
    gl.bindSampler(gl.TEXTURE0, sam);
  }
};

// DOM-based util

export const fetchGlContext = (canvasId: string): WebGL2RenderingContext => {
  const glCanvas = (document.getElementById(canvasId) as HTMLCanvasElement);
  if (!glCanvas) throw new Error('no canvas for you');
  const gl = glCanvas.getContext('webgl2');
  if (!gl) throw new Error('no webgl2 context for you');
  return gl;
};

export const resizeGl = (containerId: string, gl: WebGL2RenderingContext): void => {
  const frame = document.getElementById( containerId);
  if (frame) {
    const br = frame.getBoundingClientRect();
    gl.canvas.width = br.right - br.left;
    gl.canvas.height = br.bottom - br.top;
    // no really, one day we will render here
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }
};
