import React, { FC, memo } from 'react';
import { useHourly } from '../../../hooks/simulation';
import Simulation from '../../../simulation';

export const Watcher: FC = memo(() => {
  useHourly(undefined, true);
  return <div>
    <pre>{Simulation.scratch.lastSimulationTime}</pre>
    <pre>{Simulation.settings._test}</pre>
    <button onClick={() => Simulation.start()}>Start</button>
    <button onClick={() => Simulation.stop()}>Stop</button>
  </div>;
});
