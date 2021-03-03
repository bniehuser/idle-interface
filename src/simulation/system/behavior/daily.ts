import { Birthday } from './life';
import { Never, PersonNode, Selector } from './tree';

export const DailyTree: PersonNode = Selector(
  Never(Birthday), // always run this, never return based on it
);
