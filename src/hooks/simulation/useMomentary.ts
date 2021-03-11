import { useEffect, useState } from 'react';
import Simulation from '../../simulation';
import { SimulationSubscriber } from '../../simulation/state';
import { MINUTE } from '../../util/const/time';

export const useMomentary = (f?: SimulationSubscriber, refresh?: boolean) => {
  const [, forceRefresh] = useState(false);
  const subscriber: SimulationSubscriber = t => {
    if (f) f(t);
    if (refresh) forceRefresh(s => !s);
  };
  useEffect(() => {
    Simulation.subscribe(subscriber, MINUTE);
    return () => Simulation.unsubscribe(subscriber, MINUTE);
  }, []);
};
