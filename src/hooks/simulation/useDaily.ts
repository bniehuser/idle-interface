import { useEffect, useState } from 'react';
import Simulation, { SimulationSubscriber } from '../../simulation';
import { DAY } from '../../util/const/time';

export const useDaily = (f?: SimulationSubscriber, refresh?: boolean) => {
  const [, forceRefresh] = useState(false);
  const subscriber: SimulationSubscriber = t => {
    if (f) f(t);
    if (refresh) forceRefresh(s => !s);
  };
  useEffect(() => {
    Simulation.subscribe(subscriber, DAY);
    return () => Simulation.unsubscribe(subscriber, DAY);
  }, []);
};
