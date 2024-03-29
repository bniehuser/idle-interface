import { mergeDeep } from '../../../util/data-access';
import { DeferredBehavior } from '../../system/behavior/defer';
import { EntityScratch } from '../entity';
import { MapPoint } from '../map';

export interface PersonScratch extends EntityScratch {
  target: number;
  interactionInitiated: number;
  interacting: boolean;
  initiated: boolean;
  movement: {
    moving: boolean;
    path: MapPoint[];
    speed: number;
  };
  near: {
    lastCheck: number,
    people: {[k: number]: number},
  };
  deferred: DeferredBehavior[];
  marker?: HTMLDivElement;
}

export const createPersonScratch = (data: Partial<PersonScratch> = {}): PersonScratch => mergeDeep({
  target: 0,
  interactionInitiated: 0,
  interacting: false,
  initiated: false,
  movement: {
    moving: false,
    path: [],
    speed: 0,
  },
  near: {
    lastCheck: 0,
    people: {},
  },
  deferred: [],
}, data);
