import { bbPerson } from './util/blackboard';
import { TNode } from './tree';
import Simulation from '../../../index';

let DEFER_IDX = 1;
const DEFER_LOOKUP: { [k: number]: TNode } = {};
const deferrableKey = (child: TNode): number => {
  let nk = parseInt(Object.keys(DEFER_LOOKUP).find(k => DEFER_LOOKUP[parseInt(k, 10)] === child) || '0', 10);
  if (!nk) {
    nk = DEFER_IDX++;
    DEFER_LOOKUP[nk] = child;
  }
  return nk;
};
const getDeferrable = (k: number): TNode => {
  return DEFER_LOOKUP[k];
};

type DeferredBehavior = {
  time: number;
  action: number;
};

// needs to take a function so it can be generated per call
type DurationFunction = () => number;
type Duration = number|DurationFunction;

// system specific decorator
export const Defer = (child: TNode, duration: Duration): TNode => id => {
  if (id) {
    const bp = bbPerson(id, Simulation.bb);
    const d: DeferredBehavior[] = bp.deferred || [];
    d.push({
      time: Simulation.bb.lastSimulationTime + (typeof duration === 'number' ? duration : duration()),
      action: deferrableKey(child),
    });
    d.sort((a, b) => a.time - b.time);
    bp.deferred = d;
  }
  return true;
};

export const DoDeferred: TNode = id => {
  if (id) {
    const bp = bbPerson(id, Simulation.bb);
    const nd = bp.deferred?.[0];
    if (nd && nd.time < Simulation.bb.lastSimulationTime) {
      const d = bp.deferred.shift();
      return getDeferrable(d.action)(id);
    }
  }
  return false;
};

export const DoAllDeferred: TNode = id => {
  if (id) {
    const bp = bbPerson(id, Simulation.bb);
    let nd = bp.deferred?.[0];
    while (nd && nd.time < Simulation.bb.lastSimulationTime) {
      const d = bp.deferred.shift();
      getDeferrable(d.action)(id);
      nd = bp.deferred?.[0];
    }
  }
  return true;
};
