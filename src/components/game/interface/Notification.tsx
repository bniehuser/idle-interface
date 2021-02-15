import React, { FC, memo } from 'react';
import { GameEvent, GameNotification } from '../../../context/game';
import DateNote from './DateNote';
import EmojiNote from './EmojiNote';
import Val from './Val';
import { Person } from '../../../game/entity/person';

type NotificationProps = { n: GameNotification, p?: Person };

const eventNotification = (content: string|GameEvent, p?: Person) => {
  if (typeof content === 'string') { return content; }
  switch (content.type) {
    case 'birthday':
      return <>Happy <Val val={content.val as number}/>, {p?.avatar}{p?.name.given} {p?.name.family}!</>;
    default:
      return JSON.stringify(content);
  }
};

const Notification: FC<NotificationProps> = ({n, p}) => {
  return <div style={{display: 'flex', fontSize: '85%', marginBottom: '.25rem'}}><DateNote t={n.at}/>
    <EmojiNote type={n.type}>{eventNotification(n.content, p)}</EmojiNote>
  </div>;
};
export default memo(Notification);
