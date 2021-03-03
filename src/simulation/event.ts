import { DAY } from '../util/const/time';
import Simulation from './index';

export const cullEvents = (t: number) => {
  Simulation.state.events = Simulation.state.events.filter(e => e.at > t - DAY);
}
