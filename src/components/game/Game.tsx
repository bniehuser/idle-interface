import React, { FC, memo, useEffect } from 'react';
import { GameEngine } from 'react-game-engine';
import Clock from './hud/Clock';
import { Game as GameObject, useGameBlackboard, useGameDispatch, useGameStateRef } from '../../context/game';
import CSS from 'csstype';
import { AI, GameTime } from '../../game/system';
import Map from './display/Map';

const Game: FC<{ style: CSS.Properties }> = ({style}) => {
  const sr = useGameStateRef();
  const dispatch = useGameDispatch();
  const bb = useGameBlackboard();
  useEffect(() => {
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
