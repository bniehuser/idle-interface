import React, { FC, memo, useEffect } from 'react';
import { GameEngine } from 'react-game-engine';
import Clock from './hud/Clock';
import { Game as GameObject, useGameBlackboard, useGameDispatch, useGameStateRef } from '../../context/game';
import CSS from 'csstype';
import { AI, GameTime } from '../../game/system';
import Map from './display/Map';
import Simulation from '../../game';
import { DAY, HOUR, MINUTE } from '../../util/const/time';
import { runMomentary } from '../../game/system/ai/momentary';
import { runHourly } from '../../game/system/ai/hourly';
import { runDaily } from '../../game/system/ai/daily';

const Game: FC<{ style: CSS.Properties }> = ({style}) => {
  const sr = useGameStateRef();
  const dispatch = useGameDispatch();
  const bb = useGameBlackboard();
  useEffect(() => {

    Simulation.init({
      subscribers: {
        [MINUTE]: [runMomentary],
        [HOUR]: [runHourly],
        [DAY]: [runDaily],
      },
    });
    Simulation.start();

    dispatch({type: 'addRandomPeople', num: 500});
    dispatch({type: 'notify', key: 'gear', content: 'Game Initialized.'});
  }, []);
  return <GameEngine style={style}
    systems={[
      (game: GameObject) => ({...game, state: sr.state}), // this need SERIOUS rethought
      GameTime,
      AI,
    ]}
    entities={{
      state: sr.state,
      dispatch,
      blackboard: bb,
      clock: {renderer: <Clock/>},
    }}
  >
    <Map/>
  </GameEngine>;
};

export default memo(Game);
