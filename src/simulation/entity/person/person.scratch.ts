import { DeferredBehavior } from '../../system/behavior/defer';
import { EntityScratch } from '../entity';

export interface PersonScratch extends EntityScratch {
  target: number;
  interactionInitiated: number;
  interacting: boolean;
  initiated: boolean;
  near: {
    lastCheck: number,
    people: {[k: number]: number},
  };
  deferred: DeferredBehavior[];
}
