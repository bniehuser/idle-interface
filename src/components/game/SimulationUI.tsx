import CSS from 'csstype';
import React, { FC, memo, useEffect, useState } from 'react';
import Simulation from '../../simulation';
import { createMap } from '../../simulation/entity/map';
import { addPerson, createRandomPerson } from '../../simulation/entity/person';
import { dailyAI, hourlyAI, momentaryAI } from '../../simulation/system';
import { SimulationEventType } from '../../simulation/system/event';
import { DAY, HOUR, MINUTE } from '../../util/const/time';
import { Map } from './display/Map';
import Clock from './hud/Clock';

const SimulationUI: FC<{ style: CSS.Properties }> = ({style}) => {
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {

    if(!Simulation.settings.initialized) {

      Simulation.start(); // totally premature

      // i feel like there should be a smarter way to do this initialization stuff, probably in a 'load()' function
      const numPeople = 500;
      const width = 512;
      const height = 512;

      createMap(Simulation.scratch, {width, height}, map => {
        Simulation.event({type: SimulationEventType.Map, sub: 'created', public: false});
        Simulation.state.map = map;
        Simulation.event({type: SimulationEventType.Notify, data: `Created ${width} x ${height} map.`});

        Array.from(Array(numPeople), () => {
          addPerson(Simulation.state.people, createRandomPerson(Simulation.state));
        });
        Simulation.event({type: SimulationEventType.Notify, data: `Loaded ${numPeople} random people.`});

        // here we're just managing some things up front that we know should be set for the life of the simulation
        Simulation.init({
          subscribers: {
            [MINUTE]: [momentaryAI],
            [HOUR]: [hourlyAI],
            [DAY]: [dailyAI],
          },
        });
        Simulation.event({type: SimulationEventType.Notify, data: `Simulation Initialized.`});

        setInitialized(true);
      });
    } else {
      setInitialized(true);
    }
  }, []);
  return !initialized ? null : <div style={{...style, flex: '1 1 0%'}}>
    <Map/>
    <Clock/>
  </div>;
};

export default memo(SimulationUI);
