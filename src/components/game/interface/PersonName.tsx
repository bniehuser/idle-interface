import React, { FC, memo } from 'react';
import Simulation from '../../../simulation';
import PersonCard from './PersonCard';
import Tooltip from './Tooltip';

type PCProps = { id: number };

export const PersonName: FC<PCProps> = ({ id }) => {
  const person = Simulation.state.people.all[id];
  const stateData = Simulation.scratch.people[id];
  if (!person) {
    return <span>Could not find person: {id}</span>;
  }
  return <Tooltip noFormat={true} tip={<PersonCard person={person} stateData={stateData}/>}>{person.avatar}{person.name.given} {person.name.family}</Tooltip>;
};
export default memo(PersonName);
