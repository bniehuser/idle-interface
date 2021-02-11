import React, { FC } from 'react';
import moment from 'moment';
import { useGameState } from '../../../context/game';

const Clock: FC = () => {
  const game = useGameState();
  return <div className={'clock'}>{moment(game.gameTime).format('YYYY-MM-DD h:mm a')}</div>;
};

export default Clock;
