import React, { FC, useCallback, useEffect, useState } from 'react';
import { OverlappingModel } from 'wavefunctioncollapse';
import Emoji from '../../interface/Emoji';

const drawGrid = (ctx: CanvasRenderingContext2D, divisions: number, divisionsy: number|undefined = undefined) => {
  const xdiv = ctx.canvas.width / divisions;
  const ydiv = ctx.canvas.height / (divisionsy || divisions);
  ctx.lineWidth = .1;
  ctx.strokeStyle = '#666';
  ctx.beginPath();
  Array.from(Array(Math.max(divisions, divisionsy || 0))).forEach((_, i) => {
    if (i > 0) {
      if (i < divisions) {
        ctx.moveTo(i * xdiv, 0);
        ctx.lineTo(i * xdiv, ctx.canvas.height);
      }
      if (i < (divisionsy || divisions)) {
        ctx.moveTo(0, i * ydiv);
        ctx.lineTo(ctx.canvas.width, i * ydiv);
      }
    }
  });
  ctx.stroke();
};

const drawContent = (ctx: CanvasRenderingContext2D, size: [number, number], content: SparseArray, palette: Color[]) => {
  for (let x = 0; x < size[0]; x++) {
    if (content[x]?.length) {
      for (let y = 0; y < size[1]; y++) {
        if (content[x]?.[y] !== undefined) {
          let idx = content[x]?.[y];
          if (idx === undefined) idx = -1;
          const c = palette[idx] || [255, 255, 255, 255];
          ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3] / 255})`;
          ctx.fillRect(x * VIEW_SCALE, y * VIEW_SCALE, VIEW_SCALE, VIEW_SCALE);
        }
      }
    }
  }
};

type Color = [number, number, number, number];
type SparseArray = ((number|undefined)[]|undefined)[];

const componentToHex = (c: number): string => {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

const hexToRgb = (hex: string): Color => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error('bad hex value: ' + hex);
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
    255,
  ];
};

const toRgb = (c: Color) => {
  return rgbToHex(c[0], c[1], c[2]);
};

const VIEW_SCALE = 16; // visual pixels per actual pixel

const inputToOutput = (input: SparseArray, size: [number, number], outputSize: [number, number], sample: number, inTile: boolean, outTile: boolean, mirror: number): SparseArray => {
  const na = [];
  for (let y = 0; y < size[1]; y++) {
    for (let x = 0; x < size[0]; x++) {
      let c = input[x]?.[y];
      if (c === undefined) c = 255;
      na.push(c, c, c, 255);
    }
  }
  const imgPx = new Uint8ClampedArray(na);
  const t = new OverlappingModel(imgPx, size[0], size[1], sample, outputSize[0], outputSize[1], inTile, outTile, mirror);
  let tries = 0;
  let s = false;
  while (!s && tries < 10) {
    s = t.generate(Math.random);
    tries++;
  }
  if (s) {
    const v = t.graphics();
    const newOut = [];
    if (v) {
      for (let i = 0; i < v.length / 4; i++) {
        const gx = i % outputSize[0];
        const gy = (i / outputSize[0]) | 0;
        const ny: number[] = newOut[gx] || [];
        ny[gy] = v[i * 4];
        newOut[gx] = ny;
      }
      return newOut;
    }
  }
  return [];
};

const drawTiled = (ctx: CanvasRenderingContext2D, size: [number, number], data: SparseArray, palette: Color[]) => {
  // make imageData from SparseArray
  const na = [];
  for (let y = 0; y < size[1]; y++) {
    for (let x = 0; x < size[0]; x++) {
      const idx = data[x]?.[y];
      let c = [255, 255, 255, 255];
      if (idx !== undefined) {
        c = palette[idx] || [255, 255, 255, 255]; // default sufficiently out of range
      }
      na.push(...c);
    }
  }
  const id = new ImageData(new Uint8ClampedArray(na), size[0], size[1]);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      ctx.putImageData(id, x * size[0], y * size[1]);
    }
  }
};

type WFCParams = {
  sample: number,
  inTile: boolean,
  outTile: boolean,
  mirror: number,
  ground: number,
};

export const TileBuilder: FC = () => {

  const [inputSize, setInputSize] = useState<[number, number]>([8, 8]);
  const [inputCtx, setInputCtx] = useState<CanvasRenderingContext2D|undefined>(undefined);
  const [inputArray, setInputArray] = useState<SparseArray>([]);
  const [outputSize, setOutputSize] = useState<[number, number]>([32, 32]);
  const [outputCtx, setOutputCtx] = useState<CanvasRenderingContext2D|undefined>(undefined);
  const [outputArray, setOutputArray] = useState<SparseArray>([]);
  const [tiledCtx, setTiledCtx] = useState<CanvasRenderingContext2D|undefined>(undefined);
  const [gridLines, setGridLines] = useState<boolean>(true);
  const [palette, setPalette] = useState<Color[]>([[255, 255, 255, 255], [0, 0, 0, 255], [128, 128, 128, 255]]);
  const [selectedPalette, setSelectedPalette] = useState<number>(0);
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const [params, setParams] = useState<WFCParams>({sample: 3, inTile: true, outTile: true, mirror: 8, ground: 0});

  const draw = useCallback(() => {
    if (inputCtx) {
      inputCtx.clearRect(0, 0, inputCtx.canvas.width, inputCtx.canvas.height);
      drawContent(inputCtx, inputSize, inputArray, palette);
      if (gridLines) drawGrid(inputCtx, ...inputSize);
    }
    if (outputCtx) {
      outputCtx.clearRect(0, 0, outputCtx.canvas.width, outputCtx.canvas.height);
      drawContent(outputCtx, outputSize, outputArray, palette);
      if (tiledCtx && outputArray.length) {
        drawTiled(tiledCtx, outputSize, outputArray, palette);
      }
      if (gridLines) drawGrid(outputCtx, ...outputSize);
    }
  }, [inputCtx, outputCtx, inputSize, outputSize, inputArray, outputArray, gridLines, palette]);

  useEffect(() => {
    const wfcInput = document.getElementById('wfcInput') as HTMLCanvasElement;
    const wfcOutput = document.getElementById('wfcOutput') as HTMLCanvasElement;
    const wfcTiled = document.getElementById('wfcTiled') as HTMLCanvasElement;
    if (!wfcInput || !wfcOutput || !wfcTiled) {
      throw new Error('could not find interaction canvases');
    }
    setInputCtx(wfcInput.getContext('2d') as CanvasRenderingContext2D);
    setOutputCtx(wfcOutput.getContext('2d') as CanvasRenderingContext2D);
    setTiledCtx(wfcTiled.getContext('2d') as CanvasRenderingContext2D);
    const mouseDownHandler = (e: MouseEvent) => { e.stopPropagation(); setMouseDown(true); };
    const mouseUpHandler = () => setMouseDown(false);
    wfcInput.addEventListener('mousedown', mouseDownHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    return () => {
      // probably totally unnecessary since the element will be removed, but let's help out the gc a little
      wfcInput.removeEventListener('mousedown', mouseDownHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };
  }, []);

  useEffect(() => {
    console.log('should draw!');
    draw();
  }, [inputCtx, outputCtx, inputSize, outputSize, gridLines, inputArray, outputArray, palette]);

  const clickInput = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const x = (e.nativeEvent.offsetX / VIEW_SCALE) | 0;
    const y = (e.nativeEvent.offsetY / VIEW_SCALE) | 0;
    const ny = inputArray[x] || [];
    if (ny[y] !== selectedPalette) {
      ny[y] = selectedPalette;
      inputArray[x] = ny;
      setInputArray([...inputArray]);
    }
  };

  return <div className={'interface'}>
    <h2>Tile Builder</h2>
    <h3>Wave Function Collapse</h3>
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <div style={{padding: '.5em'}}>
        {palette.map((c, i) => <span key={'p_' + i} style={{margin: '.25em', border: i === selectedPalette ? '2px solid white' : ''}} onClick={() => setSelectedPalette(i)}>
          <input type='color' value={toRgb(c)} onChange={e => {
            palette[i] = hexToRgb(e.target.value);
            setPalette([...palette]);
          }}/>
        </span>)}<span style={{borderRadius: '.5em', background: '#666', cursor: 'pointer'}} onClick={() => setPalette([...palette, [255, 255, 255, 255]])}><Emoji type={'plus'}/><Emoji type={'rainbow'}/></span><br/>
        Grid? <input type={'checkbox'} checked={gridLines} onChange={e => setGridLines(e.target.checked)}/>
      </div>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <div style={{padding: '.5em'}}>
          <div style={{marginBottom: '.5em'}}>
            <input style={{width: '4em'}} type={'number'} value={inputSize[0]} onChange={e => setInputSize([parseInt(e.target.value, 10) || 1, inputSize[1]])}/>&nbsp;
            x <input style={{width: '4em'}} type={'number'} value={inputSize[1]} onChange={e => setInputSize([inputSize[0], parseInt(e.target.value, 10) || 1])}/>
          </div>
          <canvas id={'wfcInput'} style={{border: '3px solid #666'}} width={VIEW_SCALE * inputSize[0]} height={VIEW_SCALE * inputSize[1]} onMouseMove={e => { if (mouseDown) clickInput(e); }}/>
        </div>
        <div style={{padding: '.5em', width: 'auto'}} className={'interface'}>
          <div style={{marginBottom: '.5em'}}>
            Sample: <input type={'number'} min={1} max={8} style={{width: '4em'}} value={params.sample} onChange={e => setParams({...params, sample: parseInt(e.target.value, 10)})}/>
          </div>
          <div style={{marginBottom: '.5em'}}>
            Mirror: <input type={'number'} min={0} max={8} style={{width: '4em'}} value={params.mirror} onChange={e => setParams({...params, mirror: parseInt(e.target.value, 10)})}/>
          </div>
          <div style={{marginBottom: '.5em'}}>
            Input Tiled? <input type={'checkbox'} checked={params.inTile} onChange={e => setParams({...params, inTile: e.target.checked})}/>
          </div>
          <div style={{marginBottom: '.5em'}}>
            Output Tiled? <input type={'checkbox'} checked={params.outTile} onChange={e => setParams({...params, outTile: e.target.checked})}/>
          </div>
          <button onClick={() => {
            setOutputArray(inputToOutput(inputArray, inputSize, outputSize, params.sample, params.inTile, params.outTile, params.mirror));
          }}>reduce uncertainty</button>
        </div>
        <div style={{padding: '.5em'}}>
          <div style={{marginBottom: '.5em'}}>
            <input style={{width: '4em'}} type={'number'} value={outputSize[0]} onChange={e => setOutputSize([parseInt(e.target.value, 10) || 1, outputSize[1]])}/>&nbsp;
            x <input style={{width: '4em'}} type={'number'} value={outputSize[1]} onChange={e => setOutputSize([outputSize[0], parseInt(e.target.value, 10) || 1])}/>
          </div>
          <canvas id={'wfcOutput'} style={{border: '3px solid #666'}} width={VIEW_SCALE * outputSize[0]} height={VIEW_SCALE * outputSize[1]}/>
        </div>
        <div style={{padding: '.5em', display: outputArray.length ? '' : 'none'}}>
          <canvas id={'wfcTiled'} style={{transform: 'scale(2)', transformOrigin: '0 0', border: '3px solid #666'}} width={3 * outputSize[0]} height={3 * outputSize[1]}/>
        </div>
      </div>
    </div>
  </div>;
};
