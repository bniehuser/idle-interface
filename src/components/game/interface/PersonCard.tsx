import React, { FC, memo } from 'react';
import useTimedRefresh from '../../../hooks/useTimedRefresh';
import { Person } from '../../../simulation/entity/person';

type PCProps = { person: Person, stateData?: any };

export const PersonCard: FC<PCProps> = ({person, stateData}) => {

  useTimedRefresh(200);

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
    </div>
  </div>;
};
export default memo(PersonCard);
