import React, { FC } from 'react';
import { EmojiKey, EmojiVariant, htmlEmoji } from '../../../util/emoji';

interface IEmojiProps {
    type: EmojiKey;
    alt?: EmojiVariant;
}

const Emoji: FC<IEmojiProps> = ({type, alt}) => {
    return <>{htmlEmoji(type, alt)}</>;
};

export default Emoji;