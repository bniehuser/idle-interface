import Simulation from '../../index';
import { PersonNode } from './tree';
import { bbPerson } from './util/blackboard';

let DEFER_IDX = 1;
const DEFER_LOOKUP: { [k: number]: PersonNode } = {};
const deferrableKey = (child: PersonNode): number => {
  let nk = parseInt(Object.keys(DEFER_LOOKUP).find(k => DEFER_LOOKUP[parseInt(k, 10)] === child) || '0', 10);
  if (!nk) {
    nk = DEFER_IDX++;
    DEFER_LOOKUP[nk] = child;
  }
  return nk;
};
const getDeferrable = (k: number): PersonNode => {
  return DEFER_LOOKUP[k];
};

export type DeferredBehavior = {
  time: number;
  action: number;
};

// needs to take a function so it can be generated per call
type DurationFunction = () => number;
type Duration = number|DurationFunction;

// system specific decorator
export const Defer = (child: PersonNode, duration: Duration) => (id: number) => {
  const bp = bbPerson(id);
  const d: DeferredBehavior[] = bp.deferred || [];
  d.push({
    time: Simulation.scratch.processTime + (typeof duration === 'number' ? duration : duration()),
    action: deferrableKey(child),
  });
  d.sort((a, b) => a.time - b.time);
  bp.deferred = d;
  return true;
};

export const DoDeferred: PersonNode = id => {
  const bp = bbPerson(id);
  const nd = bp.deferred?.[0];
  if (nd && nd.time < Simulation.scratch.processTime) {
    bp.deferred.shift();
    return getDeferrable(nd.action)(id);
  }
  return false;
};

export const DoAllDeferred: PersonNode = id => {
  const bp = bbPerson(id);
  let nd = bp.deferred?.[0];
  while (nd && nd.time < Simulation.scratch.processTime) {
    bp.deferred.shift();
    getDeferrable(nd.action)(id);
    nd = bp.deferred?.[0];
  }
  return true;
};
