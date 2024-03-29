import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import TileSet from '../../../../public/img/TileSet.png';
import { useGameBlackboard, useGameDispatch, useGameStateRef } from '../../../context/game';
import { createMap, MapDisplay, renderMap } from '../../../simulation/entity/map';
import { Person_old } from '../../../simulation/entity/person_old';
import { htmlEmoji } from '../../../util/emoji';
import { OS } from '../../../util/platform';
import PersonCard from '../interface/PersonCard';

// TODO: get all this sprite drawing nonsense out of here, map should purely handle dom setup and interaction

const bigIcons = [
  htmlEmoji('baby', 'light'),
  htmlEmoji('baby', 'med-light'),
  htmlEmoji('baby', 'med'),
  htmlEmoji('baby', 'med-dark'),
  htmlEmoji('baby', 'dark'),
  htmlEmoji('boy', 'light'),
  htmlEmoji('boy', 'med-light'),
  htmlEmoji('boy', 'med'),
  htmlEmoji('boy', 'med-dark'),
  htmlEmoji('boy', 'dark'),
  htmlEmoji('girl', 'light'),
  htmlEmoji('girl', 'med-light'),
  htmlEmoji('girl', 'med'),
  htmlEmoji('girl', 'med-dark'),
  htmlEmoji('girl', 'dark'),
  htmlEmoji('man', 'light'),
  htmlEmoji('man', 'med-light'),
  htmlEmoji('man', 'med'),
  htmlEmoji('man', 'med-dark'),
  htmlEmoji('man', 'dark'),
  htmlEmoji('woman', 'light'),
  htmlEmoji('woman', 'med-light'),
  htmlEmoji('woman', 'med'),
  htmlEmoji('woman', 'med-dark'),
  htmlEmoji('woman', 'dark'),
  htmlEmoji('old-man', 'light'),
  htmlEmoji('old-man', 'med-light'),
  htmlEmoji('old-man', 'med'),
  htmlEmoji('old-man', 'med-dark'),
  htmlEmoji('old-man', 'dark'),
  htmlEmoji('old-woman', 'light'),
  htmlEmoji('old-woman', 'med-light'),
  htmlEmoji('old-woman', 'med'),
  htmlEmoji('old-woman', 'med-dark'),
  htmlEmoji('old-woman', 'dark'),
];
const smallIcons = [
  htmlEmoji('speech'),
  htmlEmoji('yell'),
  htmlEmoji('thought'),
];

type SpriteDimensions = {x: number, y: number, h: number, w: number};
type SpriteInfo = {[k: string]: SpriteDimensions};

const spriteInfo: SpriteInfo = {
  ...bigIcons.reduce((a, c, i) => {
    a[c] = {x: i * 32, y: 0, h: 32, w: 32};
    return a;
  }, {} as SpriteInfo),
  ...smallIcons.reduce((a, c, i) => {
    a[c] = {x: i * 16, y: 32, h: 16, w: 16};
    return a;
  }, {} as SpriteInfo),
};

const drawAvatar = (ctx: CanvasRenderingContext2D, x: number, y: number, avatar: string, action?: string) => {
  const a = spriteInfo[avatar];
  ctx.drawImage(spriteBufferCanvas, a.x, a.y, a.w, a.h, x, y, a.w, a.h);
  if (action) {
    const i = spriteInfo[action];
    ctx.drawImage(spriteBufferCanvas, i.x, i.y, i.w, i.h, x + 25, y - 8, i.w, i.h);
  }
  // console.log('should draw', avatar, 'at', [x, y]);
};

const spriteBufferCanvas = document.createElement('canvas');
spriteBufferCanvas.height = 48;
spriteBufferCanvas.width = Math.max(bigIcons.length * 32, smallIcons.length * 16);

const initSpriteBuffer = () => {
  const ctx = spriteBufferCanvas.getContext('2d');
  if (ctx) {
    Object.keys(spriteInfo).forEach(k => {
      const s = spriteInfo[k];
      // TODO: extrapolate a set of emoji characteristics by OS in the emoji util
      const emojiHeight = OS === 'Windows' ? 25 : 32;
      const h = (s.h === 16 ? 14 : emojiHeight);
      ctx.font = h + 'px sans-serif';
      ctx.fillText(k, s.x, s.y + h - 1); // fonts are baseline, so print at bottom
    });
  } else {
    console.error('NO SPRITE CANVAS CONTEXT');
  }
};

const OldMap: FC = () => {
  const sr = useGameStateRef();
  const d = useGameDispatch();
  const bb = useGameBlackboard();
  const ref = useRef<HTMLDivElement>(null);
  const [cd, setD] = useState({w: 0, h: 0});
  const [hoverData, setHoverData] = useState<{ person: Person_old, stateData?: any }|undefined>(undefined);
  const [mousePos, setMousePos] = useState<[number, number]>([0, 0]);
  const [mapDisplay, setMapDisplay] = useState<MapDisplay|undefined>(undefined);
  const [mapOffset, setMapOffset] = useState<[number, number]>([0, 0]);
  const [dragOffset, setDragOffset] = useState<[number, number]>([0, 0]);
  // const [clientMousePos, setClientMousePos] = useState<[number, number]>([0, 0]);
  const [moving, setMoving] = useState<boolean>(false);
  const [tileLoaded, setTileLoaded] = useState<boolean>(false);
  const [tileSet] = useState<HTMLImageElement>(document.createElement('img'));

  useEffect(() => {
    // we'll be killing this shortly
    document.addEventListener('keydown', e => {
      d({type: 'notify', content: `pressed the ${e.code} (${e.key}) key`});
    });

    // world's saddest asset loader
    tileSet.src = TileSet;
    tileSet.onload = () => {
      setTileLoaded(true);
    };
    initSpriteBuffer();
  }, []);

  useEffect(() => {
    if (tileLoaded) {
      // to be more react-y should these be handled with refs?  seems to work as-is
      const mapCanvas = document.getElementById('map-canvas') as HTMLCanvasElement;
      const spriteCanvas = document.getElementById('sprite-canvas') as HTMLCanvasElement;

      const newD = {w: spriteCanvas.offsetWidth, h: spriteCanvas.offsetHeight};
      setD(newD);

      const mapCtx = mapCanvas.getContext('2d', {alpha: false});
      if (mapCanvas && mapCtx && spriteCanvas) {
        const map = sr.state.map || (() => {
          const m = createMap({});
          d({type: 'notify', content: `finished building map: (${m.width},${m.height})`});
          return m;
        })();
        d({type: 'setMap', map});
        setMapDisplay({
          map,
          canvas: mapCanvas,
          spriteCanvas: spriteCanvas,
          spriteBuffer: spriteBufferCanvas,
          ctx: mapCtx,
          tileImg: tileSet,
          spriteImg: spriteCanvas,
        });
      } else {
        throw new Error('something is horribly wrong, could not find map or sprite canvas');
      }
    }
  }, [tileLoaded, sr.state.map]);

  const doHoverId = useCallback((id: number): boolean => { setHoverData({ person: sr.state.people.all[id], stateData: bb.people[id] }); return true; }, []);
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDragOffset([e.pageX, e.pageY]);
    setMoving(true);
    // console.log('how many times do we run?', [e.pageX, e.pageY]);
    return false;
  }, []);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos([e.clientX, e.clientY]);
    if (moving) {
      const offsetX = mapOffset[0] + (e.pageX - dragOffset[0]);
      const offsetY = mapOffset[1] + (e.pageY - dragOffset[1]);
      // setClientMousePos([e.pageX, e.pageY]);
      if (mapDisplay) {
        requestAnimationFrame(() => {
          renderMap(mapDisplay, offsetX, offsetY);
          renderSprites(mapDisplay, offsetX, offsetY);
        });
      }
    } else {
      const rect = (document.getElementById('sprite-canvas') as HTMLCanvasElement).getBoundingClientRect();
      const posX = Math.floor((e.clientX - rect.left - mapOffset[0]) / 32);
      const posY = Math.floor((e.clientY - rect.top - mapOffset[1]) / 32);
      setMousePos([e.clientX - rect.left, e.clientY - rect.top]);
      // this should really be integrated elsewhere -- scanning all living people's data on mousemove is expensive
      const r = sr.state;
      if (!r.people.living.some(id => (r.people.all[id].location.x === posX && r.people.all[id].location.y === posY) ? doHoverId(id) : false)) {
        setHoverData(undefined);
      }
    }
  }, [mapOffset, dragOffset]);
  const onMouseUp = useCallback((e: React.MouseEvent) => {
    setMoving(false);
    setMapOffset([mapOffset[0] + (e.pageX - dragOffset[0]), mapOffset[1] + (e.pageY - dragOffset[1])]);
  }, [dragOffset]);

  const renderSprites = useCallback((mapDisplay: MapDisplay, offsetX: number, offsetY: number) => {
    // bconsole.log('s.gameTime', s.gameTime);
    const ctx = mapDisplay.spriteCanvas.getContext('2d');
    const {width: w, height: h} = mapDisplay.spriteCanvas;
    if (ctx) {
      ctx.clearRect(0, 0, w, h);
      const [lx, bx, ly, by] = [
        Math.floor(-offsetX / 32),
        Math.ceil((w - offsetX) / 32),
        Math.floor(-offsetY / 32),
        Math.ceil((h - offsetY) / 32),
      ];
      Object.values(sr.state.people.all).forEach(p => {
        const {x, y} = p.location;
        if (x >= lx && x <= bx && y >= ly && y <= by) {
          drawAvatar(ctx, x * 32 + offsetX, y * 32 + offsetY, p.avatar, bb.people[p.id]?.interacting ? htmlEmoji('speech') : undefined);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (mapDisplay && !moving) {
      renderMap(mapDisplay, mapOffset[0], mapOffset[1]);
    }
  }, [mapDisplay, mapOffset, sr.state.map]);
  useEffect(() => {
    if (mapDisplay && !moving) {
      renderSprites(mapDisplay, mapOffset[0], mapOffset[1]);
    }
  }, [mapDisplay, mapOffset, sr.state]);

  return <div style={{position: 'relative', flexGrow: 1, width: '100%', height: '100%'}}>
    <div ref={ref}/>
    <canvas className={'canvasDisplay'} id={'map-canvas'} width={cd?.w} height={cd?.h}/>
    <canvas className={'canvasDisplay'} id={'sprite-canvas'}  width={cd?.w} height={cd?.h} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove}/>
    {sr.state.DEBUG && <div style={{position: 'absolute', top: '5px', left: '5px', background: 'rgba(0,0,0,.2)', padding: '.5rem', zIndex: 4}}>
      map offset: {mapOffset[0]} / {mapOffset[1]}<br/>
      drag offset: {dragOffset[0]} / {dragOffset[1]}<br/>
      {/*mouse pos: {clientMousePos[0]} / {clientMousePos[1]}*/}
    </div>}
    {hoverData?.person
      ? <div style={{
          transform: `translate(${(mousePos[0] < (cd.w / 2)) ? 0 : -105}%, ${(mousePos[1] < (cd.h / 2)) ? 0 : -100}%)`,
          position: 'absolute',
          zIndex: 3,
          left: (mousePos[0] + 5) + 'px',
          top: (mousePos[1] + 5) + 'px',
        }}>
          <PersonCard {...hoverData}/>
        </div>
      : null}
  </div>;
};

export default memo(OldMap);
