import React, { FC, memo } from 'react';
import PersonCard from './PersonCard';
import Tooltip from './Tooltip';
import Simulation from '../../../simulation';

type PCProps = { id: number };

export const PersonName: FC<PCProps> = ({ id }) => {
  const person = Simulation.state.people.all[id];
  const stateData = Simulation.scratch.people[id];
  return <Tooltip noFormat={true} tip={<PersonCard person={person} stateData={stateData}/>}>{person.avatar}{person.name.given} {person.name.family}</Tooltip>;
};
export default memo(PersonName);
