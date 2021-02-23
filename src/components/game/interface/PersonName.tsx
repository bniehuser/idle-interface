import React, { FC, memo } from 'react';
import { useGame } from '../../../context/game';
import PersonCard from './PersonCard';
import Tooltip from './Tooltip';

type PCProps = { id: number };

export const PersonName: FC<PCProps> = ({ id }) => {
  const [s, , bb] = useGame();
  const person = s.people[id];
  if (!person) {
    alert(id);
    return null;
  }
  const stateData = bb.people[id];
  return <Tooltip noFormat={true} tip={<PersonCard person={person} stateData={stateData}/>}>{person.avatar}{person.name.given} {person.name.family}</Tooltip>;
};
export default memo(PersonName);
