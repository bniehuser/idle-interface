import React, { FC, memo } from 'react';
import { Person } from '../../../simulation/entity/person';
import { SimulationEvent, SimulationEventType } from '../../../simulation/system/event';
import { EmojiKey, emojis } from '../../../util/emoji';
import DateNote from './DateNote';
import EmojiNote from './EmojiNote';
import { PersonName } from './PersonName';
import Val from './Val';

type NotificationProps = { n: SimulationEvent, p?: Person };

const replacementFunc: {[k: string]: (c: string, i: number) => React.ReactNode} = {
  'P': (c, i) => <PersonName key={i} id={parseInt(c, 10)}/>,
  'V': (c, i) => { const [v, o] = c.split(','); return <Val key={i} icon={o as EmojiKey} val={v}/>; },
};

const replaceShorthand = (m: string, i: number): React.ReactNode => {
  const [k, c] = m.split(/[{}]/);
  if (replacementFunc[k]) {
    return replacementFunc[k](c, i);
  } else {
    return <span style={{color: 'red'}}><em><strong>{m}</strong></em></span>;
  }
};

const eventNotification = (content: string|any): React.ReactNode => {
  if (typeof content === 'string') {
    return content
      .split(/([A-Z]{.+?})/)
      .map((c, i) => c.match(/^[A-Z]{/) ? replaceShorthand(c, i) : <span key={i}>{c}</span>);
  }
  switch (content.type) {
    case SimulationEventType.Error:
      return <pre style={{color: 'red', fontSize: '75%'}}>{JSON.stringify(content, null, '  ')}</pre>;
    default:
      return <pre style={{fontSize: '75%'}}>{JSON.stringify(content, null, '  ')}</pre>;
  }
};

const Notification: FC<NotificationProps> = ({n}) => {
  const doType = n.sub && emojis[n.sub as EmojiKey] !== undefined  ? n.sub as EmojiKey : 'gear';
  return <div style={{display: 'flex', fontSize: '85%', marginBottom: '.25rem'}}><DateNote t={n.at}/>
    <EmojiNote type={doType}>{eventNotification(n.data)}</EmojiNote>
  </div>;
};
export default memo(Notification);
