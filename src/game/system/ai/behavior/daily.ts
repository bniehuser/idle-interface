import { Never, Selector, TNode } from './tree';
import { Birthday } from './life';

export const DailyTree: TNode = Selector(
  Never(Birthday), // always run this, never return based on it
);
