import { EmojiKey } from '../../../../util/emoji';
import { TNode } from './tree';

export const Notify = (content: string, key?: EmojiKey): TNode => (_, g) => {
  g.dispatch({type: 'notify', key, content});
  return true;
};
