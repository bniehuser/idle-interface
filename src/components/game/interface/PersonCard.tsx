import { Person } from '../../../game/entity/person';
import React, { FC } from 'react';

type PCProps = { person: Person, stateData?: any };

export const PersonCard: FC<PCProps> = ({ person, stateData }) => {
  return <div className={'interface'} style={{display: 'flex', flexDirection: 'row'}}>
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <div style={{fontSize: '250%'}}>{person.avatar}</div>
      <div>Statuses</div>
    </div>
    <div>
      <div style={{fontSize: '150%'}}>{person.name.given} {person.name.family}</div>
      <div><pre>{JSON.stringify(stateData, null, '  ')}</pre></div>
    </div>
  </div>;
};
export default PersonCard;
