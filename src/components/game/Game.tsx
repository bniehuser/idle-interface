import React, { FC, memo, useEffect } from 'react';
import { GameEngine } from 'react-game-engine';
import Clock from './hud/Clock';
import { Game as GameObject, useGame } from '../../context/game';
import CSS from 'csstype';
import { AI, GameTime } from '../../game/system';
import Map from './display/Map';

const Game: FC<{ style: CSS.Properties }> = ({style}) => {
  const [state, dispatch, bb] = useGame();
  useEffect(() => {
    dispatch({type: 'addRandomPeople', num: 500});
    dispatch({type: 'notify', key: 'gear', content: 'Game Initialized.'});
  }, []);
  return <GameEngine
    systems={[
      (game: GameObject) => ({...game, state}), // this need SERIOUS rethought
      GameTime,
      AI,
    ]}
    entities={{
      state,
      dispatch,
      blackboard: bb,
      clock: {renderer: <Clock/>},
    }}
    style={style}
  >
	  <pre>{bb.parseSave}</pre>
    <Map/>
  </GameEngine>;
};

export default memo(Game);
