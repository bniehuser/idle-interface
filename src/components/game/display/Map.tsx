import React, { FC, memo, useEffect, useRef } from 'react';
import { Display, Map as RotMap } from 'rot-js';
import TileSet from '../../../../public/img/TileSet.png';
import { useGameDispatch } from '../../../context/game';

const Map: FC = () => {
  const gameDispatch = useGameDispatch();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tileSet = document.createElement('img');
    tileSet.src = TileSet;
    tileSet.onload = () => {
      const disp = new Display({
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
      const dispContainer = disp.getContainer();
      if (ref.current && dispContainer) {
        ref.current.appendChild(dispContainer);
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
        disp.draw(x, y, ['@', '#', '!'][what], '', ['green', 'brown'][what]);
        if (x + 1 === digger._width && y + 1 === digger._height) {
          gameDispatch({type: 'notify', content: `finished building map: (${x},${y})`});
        }
      });
    };
  }, []);

  return <div ref={ref}/>;
};

export default memo(Map);
