import React, { FC } from 'react';
import { useGameState } from '../../../context/game';
import Modal from '../interface/Modal';
import FastForwardProgress from '../display/FastForwardProgress';

const Modals: FC = () => {
  const game = useGameState();
  return <div style={{zIndex: 999}}> {/* force modals on top of all else */}
    <Modal visible={!!game.fastForward}><FastForwardProgress/></Modal>
    </div>;
};

export default Modals;
