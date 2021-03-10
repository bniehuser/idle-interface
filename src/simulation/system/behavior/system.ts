import { EmojiKey } from '../../../util/emoji';
import Simulation from '../../index';
import { SimulationEventType } from '../event';
import { BehaviorNode } from './tree';

export const Notify = (content: string, key: EmojiKey = 'gear'): BehaviorNode => () => {
  Simulation.event({type: SimulationEventType.Notify, sub: key, data: content});
  return true;
};
