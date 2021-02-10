import React, { FC } from 'react';
import { EmojiKey, EmojiVariant } from '../../../util/emoji';
import Emoji from './Emoji';

interface IEmojiProps {
    type?: EmojiKey|EmojiKey[];
    alt?: EmojiVariant|Array<EmojiVariant|undefined>;
}

const EmojiNote: FC<IEmojiProps> = ({type, alt, children}) => {
    const doType = typeof type === 'string' ? [type] : (type || []);
    const doAlt = typeof alt === 'string' ? [alt] : (alt || []);
    return <div>{doType.map((type, i) => <Emoji type={type} alt={doAlt[i]}/>)}{children}</div>;
};

export default EmojiNote;