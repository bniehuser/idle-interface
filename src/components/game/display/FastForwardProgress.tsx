import React, { FC } from 'react';
import { useGameState } from '../../../context/game';
import Progress from '../interface/Progress';
import moment from 'moment';

const FastForwardProgress: FC = () => {
  const game = useGameState();
  // might work?
  return <div style={{display: 'flex', flexFlow: 'column', alignItems: 'center', justifyContent: 'center', width: '33%', minWidth: '300px', height: '250px'}}>
    <h3 style={{textAlign: 'center'}}>Catching up time...</h3>
    <Progress
      min={game.gameLastTime}
      max={game.gameTime}
      current={game.processTime}
      minLabel={moment(game.gameLastTime).format('MM/DD/yy hh:mm a')}
      maxLabel={moment(game.gameTime).format('MM/DD hh:mm a')}
      currentLabel={moment(game.processTime).format('MM/DD/yy hh:mm a')}
      type={'feature'}
      color={''} // to override default for feature default
    />
  </div>;
};

export default FastForwardProgress;
