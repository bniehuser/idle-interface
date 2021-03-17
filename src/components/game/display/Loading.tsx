import React, { FC, useState } from 'react';
import Simulation from '../../../simulation';
import Progress from '../interface/Progress';

export const Loading: FC = () => {
  const [r, setR] = useState(false);
  Simulation.subscribe(() => {
    // force every frame update
    setR(!r);
  });
  // might work?
  return <div style={{display: 'flex', flexFlow: 'column', alignItems: 'center', justifyContent: 'center', width: '33%', minWidth: '300px', height: '250px'}}>
    <h3 style={{textAlign: 'center'}}>{Simulation.scratch.loading.message}</h3>
    <Progress
      min={0}
      max={100}
      current={Simulation.scratch.loading.progress}
      type={'feature'}
      color={''} // to override default for feature default
    />
  </div>;
};
