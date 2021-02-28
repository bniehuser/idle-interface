import Simulation, { SimulationSubscriber } from '../game';
import { useEffect, useState } from 'react';
import { HOUR } from '../util/const/time';

export const useHourly = (f?: SimulationSubscriber, refresh?: boolean) => {
  const [, forceRefresh] = useState(false);
  useEffect(() => {
    Simulation.subscribe(t => {
      if (f) f(t);
      if (refresh) forceRefresh(s => !s);
    }, HOUR);
  }, []);
};
