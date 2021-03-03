import CSS from 'csstype';
import React, { FC, memo, useEffect } from 'react';
import { useGameDispatch } from '../../context/game';
import Simulation from '../../simulation';
import { dailyAI, hourlyAI, momentaryAI } from '../../simulation/system';
import { DAY, HOUR, MINUTE } from '../../util/const/time';
import Map from './display/Map';
import Clock from './hud/Clock';

const Game: FC<{ style: CSS.Properties }> = ({style}) => {
  const dispatch = useGameDispatch();
  useEffect(() => {

    // here we're just managing some things up front that we know should be set for the life of the simulation
    Simulation.init({
      subscribers: {
        [MINUTE]: [momentaryAI],
        [HOUR]: [hourlyAI],
        [DAY]: [dailyAI],
      },
      _test: 'did we merge?',
    });
    // Simulation.start();

    dispatch({type: 'addRandomPeople', num: 500});
    dispatch({type: 'notify', key: 'gear', content: 'Game Initialized.'});
  }, []);
  return <div style={{...style, flex: '1 1 0%'}}><Map/><Clock/></div>;
  // return <GameEngine style={style}
  //   systems={[
  //     (game: GameObject) => ({...game, state: sr.state}), // this need SERIOUS rethought
  //   ]}
  //   entities={{
  //     state: sr.state,
  //     dispatch,
  //     blackboard: bb,
  //     clock: {renderer: <Clock/>},
  //   }}
  // >
  //   <Map/>
  // </GameEngine>;
};

export default memo(Game);
