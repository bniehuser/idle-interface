import React, { FC, memo, useEffect, useState } from 'react';
import { useMomentary } from '../../../hooks/simulation';
import Simulation from '../../../simulation';
import { Person } from '../../../simulation/entity/person';
import { SimulationEvent } from '../../../simulation/system/event';
import Notification from './Notification';

type PCProps = { person: Person, stateData?: any };

export const PersonCard: FC<PCProps> = ({person, stateData}) => {
  const [localEvents, setLocalEvents] = useState<SimulationEvent[]>([]);
  useMomentary(undefined, true);
  useEffect(() => {
    setLocalEvents(Simulation.state.events.current.filter(e => e.entityId === person.id).concat(
      Simulation.state.events.archive.filter(e => e.entityId === person.id),
    ));
    const subscriber = (e: SimulationEvent) => {
      if (e.entityId === person.id) {
        localEvents.unshift(e);
        setLocalEvents(localEvents);
      }
    };
    Simulation.subscribeEvents(subscriber);
    return () => Simulation.unsubscribeEvents(subscriber);
  }, [person]);

  return <div className={'interface'} style={{display: 'flex', flexDirection: 'row', pointerEvents: 'none'}}>
    <div style={{display: 'flex', flexDirection: 'column', marginRight: '.5rem'}}>
      <div style={{fontSize: '250%'}}>{person.avatar}</div>
      <div style={{fontSize: '85%'}}>age {person.age}</div>
      <div style={{fontSize: '85%'}}>{person.ai.decision}</div>
    </div>
    <div>
      <div style={{fontSize: '150%'}}>{person.name.given} {person.name.family}</div>
      <div>
        <pre className={'thin'} style={{
          fontSize: '85%',
          background: 'rgba(0,0,0,.2)',
          color: '#dddfee',
          padding: '.5rem',
        }}>{JSON.stringify(stateData, null, '  ')}</pre>
      </div>
      <div style={{display: 'flex', flexFlow: 'col-reverse', overflowY: 'auto', overflowX: 'hidden', maxHeight: '200px'}}>
      {localEvents.map(n => <Notification key={`n_${n.id}`} n={n}/>)}
      </div>
    </div>
  </div>;
};
export default memo(PersonCard);
