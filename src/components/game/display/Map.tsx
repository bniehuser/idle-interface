import React, { FC, memo, useEffect, useRef, useState } from 'react';
import { Display, Map as RotMap } from 'rot-js';
import TileSet from '../../../../public/img/TileSet.png';
import { useGame } from '../../../context/game';
import { htmlEmoji } from '../../../util/emoji';

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
      ctx.font = (s.h === 16 ? 14 : s.h) + 'px sans-serif';
      ctx.fillText(k, s.x, s.y + s.h - 1); // fonts are baseline, so print at bottom
    });
  } else {
    console.error('NO SPRITE CANVAS CONTEXT');
  }
};

const Map: FC = () => {
  const [s, gameDispatch, bb] = useGame();
  const ref = useRef<HTMLDivElement>(null);
  const [d, setD] = useState({w: 0, h: 0});
  useEffect(() => {
    const tileSet = document.createElement('img');
    tileSet.src = TileSet;
    tileSet.onload = () => {
      const rotDisplay = new Display({
        layout: 'tile',
        bg: 'transparent',
        tileSet,
        tileMap: {
          '@': [0, 0],
          '#': [0, 32],
          'a': [0, 128],
          '!': [0, 160],
        },
        width: 40,
        height: 32,
      });
      const displayContainer = rotDisplay.getContainer();
      if (ref.current && displayContainer) {
        ref.current.appendChild(displayContainer);
      }

      document.addEventListener('keydown', e => {
        gameDispatch({type: 'notify', content: `pressed the ${e.code} (${e.key}) key`});
      });

      const digger = new RotMap.Digger(240, 240, {
        roomHeight: [15, 25],
        roomWidth: [15, 25],
        dugPercentage: 85,
        corridorLength: [1, 25],
      });
      digger.create((x, y, what) => {
        rotDisplay.draw(x, y, ['@', '#', '!'][what], '', ['green', 'brown'][what]);
      });
      gameDispatch({type: 'notify', content: `finished building map: (${digger._width},${digger._height})`});
      initSpriteBuffer();
      const spriteCanvas = document.getElementById('sprite-canvas') as HTMLCanvasElement;
      const newD = {w: spriteCanvas.offsetWidth, h: spriteCanvas.offsetHeight};
      const resize = () => {
        console.log('ran resize');
        setD(newD);
        rotDisplay.setOptions({width: Math.floor(newD.w / 32), height: Math.floor(newD.h / 32)});
      };
      window.addEventListener('resize', resize);
      resize();
      console.log('how often are we running this anyway?');
    };
  }, []);
  useEffect(() => {
    setTimeout(() => {
      const spriteCanvas = document.getElementById('sprite-canvas') as HTMLCanvasElement;
      const ctx = spriteCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);
        Object.values(s.people).forEach(p => {
          if (p.location.x < Math.floor(d.w / 32) && p.location.y < Math.floor(d.h / 32)) {
            drawAvatar(ctx, p.location.x * 32, p.location.y * 32, p.avatar, bb.people[p.id]?.interacting ? htmlEmoji('speech') : undefined);
          }
        });
      }
    }, 100);
  }, [s, d]);

  return <div style={{position: 'relative', flexGrow: 1, width: '100%', height: '100%'}}>
    <div ref={ref}/>
    <canvas id={'sprite-canvas'} width={d?.w} height={d?.h} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%'}} />
  </div>;
};

export default memo(Map);
