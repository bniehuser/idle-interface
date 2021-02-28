import React, { FC, memo } from 'react';
import { useHourly } from '../../../hooks/useHourly';
import Simulation from '../../../game';

export const Watcher: FC = memo(() => {
  useHourly(undefined, true);
  console.log('rendering hourly?');
  return <div>
    <pre>{Simulation.bb.lastSimulationTime}</pre>
    <button onClick={() => Simulation.start()}>Start</button>
    <button onClick={() => Simulation.stop()}>Stop</button>
  </div>;
});
