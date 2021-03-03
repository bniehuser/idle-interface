import { EmojiKey } from '../../../util/emoji';
import Simulation from '../../index';
import { SimulationEventType } from '../../state';
import { BehaviorNode } from './tree';

export const Notify = (content: string, key: EmojiKey = 'gear'): BehaviorNode => () => {
  Simulation.event(SimulationEventType.Notify, key, content);
  return true;
};
