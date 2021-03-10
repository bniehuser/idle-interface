import React, { FC, useEffect, useState } from 'react';
import Simulation from '../../../simulation';
import { SimulationEvent, SimulationEventType } from '../../../simulation/system/event';
import { MINUTE } from '../../../util/const/time';
import Notification from '../interface/Notification';

const NotificationList: FC = () => {
  const [localEvents, setLocalEvents] = useState<SimulationEvent[]>([]);

  useEffect(() => {
    const handleEvents = (event: SimulationEvent) => {
      if (event.public || event.type === SimulationEventType.Notify) {
        localEvents.unshift(event);
        setLocalEvents(localEvents.slice(0, 100));
      }
    };
    Simulation.subscribeEvents(handleEvents);
    return () => Simulation.unsubscribeEvents(handleEvents);
  }, [localEvents]);

  // return <div id={'sim-notes'} style={{display: 'flex', flexFlow: 'column-reverse'}}/>; // really
  return Simulation.scratch.speed > MINUTE ? <div>Loading...</div> : <div className={'scrollable'} style={{flex: 1}}>
    {localEvents.map(n => <Notification key={`n_${n.id}`} n={n}/>)}
  </div>;
};

export default NotificationList;
