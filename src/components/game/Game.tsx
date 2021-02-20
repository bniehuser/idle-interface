import React, { FC, memo, useEffect } from 'react';
import { GameEngine } from 'react-game-engine';
import Clock from './hud/Clock';
import { GameEntities, useGame } from '../../context/game';
import CSS from 'csstype';
import GameTime from '../../game/system/GameTime';
import Map from './display/Map';
import AI from '../../game/system/ai/AI';

const Game: FC<{ style: CSS.Properties }> = ({style}) => {
  const [gameState, gameDispatch] = useGame();
  useEffect(() => {
    gameDispatch({type: 'addRandomPeople', num: 500});
    gameDispatch({type: 'notify', key: 'gear', content: 'Game Initialized.'});
  }, []);
  return <GameEngine
    systems={[
      (entities: GameEntities) => ({...entities, gameState}), // this need SERIOUS rethought
      GameTime,
      AI,
    ]}
    entities={{
      gameState,
      gameDispatch,
      clock: {renderer: <Clock/>},
    }}
    style={style}
  >
    <Map/>
  </GameEngine>;
};

export default memo(Game);
