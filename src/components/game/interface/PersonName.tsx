import React, { FC, memo } from 'react';
import Simulation from '../../../simulation';

type PCProps = { id: number };

export const PersonName: FC<PCProps> = memo(({ id }) => {
  const person = Simulation.state.people.all[id];
  if (!person) {
    return <span>Could not find person: {id}</span>;
  }
  return <span onMouseOver={() => Simulation.scratch.hoveredPerson = person.id} onMouseOut={() => Simulation.scratch.hoveredPerson = undefined}>{person.avatar}{person.name.given} {person.name.family}</span>;
});
export default PersonName;
