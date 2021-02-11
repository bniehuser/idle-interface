import React, { FC, memo } from 'react';
import { GameEngine } from 'react-game-engine';
import GameTime from '../../game/system/GameTime';
import Clock from './hud/Clock';
import { useGame } from '../../context/game';
import CSS from 'csstype';

const Game: FC<{style: CSS.Properties}> = ({style}) => {
  const [gameState, gameDispatch] = useGame();
  return <GameEngine
    systems={[
      GameTime,
    ]}
    entities={{
      gameState,
      gameDispatch,
      clock: {renderer: <Clock/>},
    }}
    style={style}
  />;
};

export default memo(Game);
