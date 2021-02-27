import React, { FC, memo } from 'react';
import { useGameBlackboard, useGameStateRef } from '../../../context/game';
import PersonCard from './PersonCard';
import Tooltip from './Tooltip';

type PCProps = { id: number };

export const PersonName: FC<PCProps> = ({ id }) => {
  const r = useGameStateRef();
  const bb = useGameBlackboard();
  const person = r.state.people.all[id];
  const stateData = bb.people[id];
  return <Tooltip noFormat={true} tip={<PersonCard person={person} stateData={stateData}/>}>{person.avatar}{person.name.given} {person.name.family}</Tooltip>;
};
export default memo(PersonName);
