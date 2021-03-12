import React, { FC, useEffect, useState } from 'react';
import Simulation from '../../../simulation';
import { SimulationEvent, SimulationEventSubtype, SimulationEventType } from '../../../simulation/system/event';
import { MINUTE } from '../../../util/const/time';
import { htmlEmoji } from '../../../util/emoji';
import Notification from '../interface/Notification';

const NotificationList: FC = () => {
  const [localEvents, setLocalEvents] = useState<SimulationEvent[]>([]);
  const [typeFilters, setTypeFilters] = useState<SimulationEventType[]>([]);
  const [subFilters, setSubFilters] = useState<SimulationEventSubtype[]>([]);

  const tfBut = (t: SimulationEventType, i: string|undefined = undefined) =>
    <span
      style={{margin: '.25em', padding: '.1em .25em', fontSize: '120%', ...!typeFilters.includes(t) ? ({border: '1px solid white', borderRadius: '.25em', background: 'rgba(44, 44, 22, .3)'}) : undefined}}
      onClick={() => setTypeFilters(typeFilters.includes(t) ? typeFilters.filter(f => f !== t) : [...typeFilters, t])}
    >{i || t}</span>;
  const sfBut = (t: SimulationEventSubtype, i: string|undefined = undefined) =>
    <span
      style={{margin: '.25em', padding: '.1em .25em', fontSize: '120%', ...!subFilters.includes(t) ? ({border: '1px solid white', borderRadius: '.25em', background: 'rgba(44, 44, 22, .3)'}) : undefined}}
      onClick={() => setSubFilters(subFilters.includes(t) ? subFilters.filter(f => f !== t) : [...subFilters, t])}
    >{i || t}</span>;

  useEffect(() => {
    const handleEvents = (event: SimulationEvent) => {
      if ((event.public || event.type === SimulationEventType.Notify) && (!typeFilters.includes(event.type) && (!event.sub || !subFilters.includes(event.sub)))) {
        localEvents.unshift(event);
        setLocalEvents(localEvents.slice(0, 100));
      }
    };
    Simulation.subscribeEvents(handleEvents);
    return () => Simulation.unsubscribeEvents(handleEvents);
  }, [localEvents]);

  useEffect(() => {
    setLocalEvents(Simulation.state.events.current.filter(event => (event.public || event.type === SimulationEventType.Notify) && (!typeFilters.includes(event.type) && (!event.sub || !subFilters.includes(event.sub)))).reverse());
  }, [typeFilters, subFilters]);

  // return <div id={'sim-notes'} style={{display: 'flex', flexFlow: 'column-reverse'}}/>; // really
  return Simulation.scratch.speed > MINUTE ? <div>Loading...</div> : <>
    <div>
      Filter:
      {tfBut(SimulationEventType.System, htmlEmoji('gear'))}
      {sfBut('birthday', htmlEmoji('birthday'))}
      {sfBut('speech', htmlEmoji('speech'))}
      {sfBut('horse', htmlEmoji('horse'))}
      {sfBut('luck', htmlEmoji('luck'))}
    </div>
    <div className={'scrollable'} style={{flex: 1}}>
    {localEvents.map(n => <Notification key={`n_${n.id}`} n={n}/>)}
  </div></>;
};

export default NotificationList;
