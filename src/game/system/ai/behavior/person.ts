import { TNode } from './tree';

export const IsOld: TNode = (p) => p.age > 60;
export const IsVeryOld: TNode = (p) => p.age > 80;
export const IsIdle: TNode = (p) => p.ai.decision === 'idle';
export const IsBusy: TNode = (p) => p.ai.decision === 'busy';

export const KillPerson = (reason: string): TNode => (p, g) => {
  g.dispatch({type: 'killPerson', personId: p.id, reason});
  return true;
};
