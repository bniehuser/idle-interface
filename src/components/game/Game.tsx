import React, { FC, memo, useEffect } from 'react';
import { GameEngine } from 'react-game-engine';
import Clock from './hud/Clock';
import { GameEntities, useGame } from '../../context/game';
import CSS from 'csstype';
import GameTime from '../../game/system/GameTime';
import HourlyAI from '../../game/system/ai/HourlyAI';
import MomentaryAI from '../../game/system/ai/MomentaryAI';
import DailyAI from '../../game/system/ai/DailyAI';
import { createPerson } from '../../game/entity/person';

const Game: FC<{style: CSS.Properties}> = ({style}) => {
  const [gameState, gameDispatch] = useGame();
  useEffect(() => {
    const people = Array(500).fill(true).map(() => {
      const birthday = new Date();
      birthday.setTime(gameState.gameTime - (Math.random() * 80 * 365.25 * 24 * 60 * 60 * 1000));
      return createPerson(gameState.gameTime, birthday.getTime());
    });
    gameDispatch({type: 'setPeople', payload: people});
    gameDispatch({type: 'notify', key: 'gear', content: 'Game Initialized.'});
  }, []);
  return <GameEngine
    systems={[
      (entities: GameEntities) => ({ ...entities, gameState }), // this need SERIOUS rethought
      GameTime,
      DailyAI,
      HourlyAI,
      MomentaryAI,
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
