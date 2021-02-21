import React, { FC } from 'react';
import { useGame } from '../../../context/game';
import Progress from '../interface/Progress';
import moment from 'moment';
import { legibleTimeDiff } from '../../../util/const/time';

const FastForwardProgress: FC = () => {
  const [game, , blackboard] = useGame();
  // might work?
  return <div style={{display: 'flex', flexFlow: 'column', alignItems: 'center', justifyContent: 'center', width: '33%', minWidth: '300px', height: '250px'}}>
    <h3 style={{textAlign: 'center'}}>Catching up time...</h3>
    <Progress
      min={blackboard.processLastTime}
      max={game.gameTime}
      current={blackboard.processTime}
      minLabel={moment(blackboard.processLastTime).format('MM/DD/yy hh:mm a')}
      maxLabel={moment(game.gameTime).format('MM/DD hh:mm a')}
      currentLabel={legibleTimeDiff(game.gameTime - blackboard.processTime)}
      type={'feature'}
      color={''} // to override default for feature default
    />
  </div>;
};

export default FastForwardProgress;
