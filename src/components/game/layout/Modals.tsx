import React, { FC } from 'react';
import { useMomentary } from '../../../hooks/simulation';
import Simulation from '../../../simulation';
import { getPersonScratch } from '../../../simulation/scratch';
import { MINUTE } from '../../../util/const/time';
import FastForwardProgress from '../display/FastForwardProgress';
import { Loading } from '../display/Loading';
import Modal from '../interface/Modal';
import { PersonCard } from '../interface/PersonCard';

const getTransform = () => {
  const { mouse } = Simulation.scratch.input;
  return [
    mouse.x + 'px',
    mouse.y + 'px',
    mouse.x > window.innerWidth / 2 ? '-105%' : '5%',
    mouse.y > window.innerHeight / 2 ? '-105%' : '5%',
  ];
};

const Modals: FC = () => {
  useMomentary(undefined, true);
  const t = getTransform();
  return <div style={{zIndex: 999, position: 'absolute'}}> {/* force modals on top of all else */}
    <Modal visible={Simulation.scratch.speed > MINUTE}><FastForwardProgress/></Modal>
    <Modal visible={Simulation.scratch.loading.active}><Loading/></Modal>
    {Simulation.scratch.hoveredPerson &&
    <div style={{position: 'absolute', top: t[1], left: t[0], transform: `translate(${t[2]}, ${t[3]})`}}>
        <PersonCard person={Simulation.state.people.all[Simulation.scratch.hoveredPerson]} stateData={getPersonScratch(Simulation.scratch, Simulation.scratch.hoveredPerson)}/>
    </div>}
    </div>;
};

export default Modals;
