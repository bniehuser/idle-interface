import React, { FC, memo } from 'react';
import { GameEvent, GameNotification } from '../../../context/game';
import DateNote from './DateNote';
import EmojiNote from './EmojiNote';
import Val from './Val';
import { Person } from '../../../game/entity/person';
import { PersonName } from './PersonName';

type NotificationProps = { n: GameNotification, p?: Person };

const eventNotification = (content: string|GameEvent, p?: Person) => {
  if (typeof content === 'string') {
    return content
      .split(/P{([0-9]+)}/)
      .map(c => c.match(/^[0-9]+$/) ? <PersonName id={parseInt(c, 10)}/> : c);
  }
  switch (content.type) {
    case 'birthday':
      return <>Happy <Val val={content.val as number}/>, {p ? <PersonName id={p.id}/> : '<unknown>'}!</>;
    default:
      return JSON.stringify(content);
  }
};

const Notification: FC<NotificationProps> = ({n, p}) => {
  return <div style={{display: 'flex', fontSize: '85%', marginBottom: '.25rem'}}><DateNote t={n.at}/>
    <EmojiNote type={n.type}><>{eventNotification(n.content, p)}</></EmojiNote>
  </div>;
};
export default memo(Notification);
