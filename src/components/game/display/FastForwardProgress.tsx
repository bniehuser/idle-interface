import moment from 'moment';
import React, { FC, useState } from 'react';
import Simulation from '../../../simulation';
import { legibleTimeDiff } from '../../../util/const/time';
import Progress from '../interface/Progress';

const FastForwardProgress: FC = () => {
  const [r, setR] = useState(false);
  Simulation.subscribe(() => {
    // force every frame update
    setR(!r);
  });
  // might work?
  return <div style={{display: 'flex', flexFlow: 'column', alignItems: 'center', justifyContent: 'center', width: '33%', minWidth: '300px', height: '250px'}}>
    <h3 style={{textAlign: 'center'}}>Catching up time...</h3>
    <Progress
      min={Simulation.scratch.catchUpFrom}
      max={Simulation.state.simulationTime}
      current={Simulation.scratch.processTime}
      minLabel={moment(Simulation.scratch.catchUpFrom).format('MM/DD/yy hh:mm a')}
      maxLabel={moment(Simulation.state.simulationTime).format('MM/DD/yy hh:mm a')}
      currentLabel={legibleTimeDiff(Simulation.state.simulationTime - Simulation.scratch.processTime)}
      type={'feature'}
      color={''} // to override default for feature default
    />
  </div>;
};

export default FastForwardProgress;
