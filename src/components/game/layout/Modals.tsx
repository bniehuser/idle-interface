import React, { FC } from 'react';
import { useGameState } from '../../../context/game';
import Modal from '../interface/Modal';
import FastForwardProgress from '../display/FastForwardProgress';

const Modals: FC = () => {
  const game = useGameState();
  return <>
    <Modal visible={!!game.fastForward}><FastForwardProgress/></Modal>
    </>;
};

export default Modals;
