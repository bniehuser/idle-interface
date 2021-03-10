import { useEffect, useState } from 'react';
import Simulation from '../../simulation';
import { SimulationSubscriber } from '../../simulation/state';
import { HOUR } from '../../util/const/time';

export const useHourly = (f?: SimulationSubscriber, refresh?: boolean) => {
  const [, forceRefresh] = useState(false);
  const subscriber: SimulationSubscriber = t => {
    if (f) f(t);
    if (refresh) forceRefresh(s => !s);
  };
  useEffect(() => {
    Simulation.subscribe(subscriber, HOUR);
    return () => Simulation.unsubscribe(subscriber, HOUR);
  }, []);
};
