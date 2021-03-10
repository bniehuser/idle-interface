import CSS from 'csstype';
import React, { FC, memo, useEffect } from 'react';
import { useGameDispatch } from '../../context/game';
import Simulation from '../../simulation';
import { dailyAI, hourlyAI, momentaryAI } from '../../simulation/system';
import { DAY, HOUR, MINUTE } from '../../util/const/time';
import { Map } from './display/Map';
import Clock from './hud/Clock';
import { addPerson, createRandomPerson } from '../../simulation/entity/person';

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

    Array.from(Array(100), () => {
      addPerson(Simulation.state.people, createRandomPerson(Simulation.state));
      console.log('adding people to simulation?', Simulation.state.people.id);
    });
    // Simulation.start();

    dispatch({type: 'addRandomPeople', num: 500});
    dispatch({type: 'notify', key: 'gear', content: 'Game Initialized.'});
  }, []);
  return <div style={{...style, flex: '1 1 0%'}}>
    <Map/>
    <Clock/>
  </div>;
};

export default memo(Game);
