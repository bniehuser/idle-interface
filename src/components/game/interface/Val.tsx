import React, { FC, memo } from 'react';
import { EmojiKey } from '../../../util/emoji';
import Emoji from './Emoji';

interface IValProps {
    val: number|string;
    icon?: EmojiKey;
}

const Val: FC<IValProps> = ({val, icon}) => {
    const numVal = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]/g, '')) : val;
    switch (icon) {
        case undefined:
            return <span className={numVal > 0 ? 'pos' : 'neg'}>{Math.abs(numVal)}</span>;
        default:
            return <span className={numVal > 0 ? 'posVal' : 'negVal'}><Emoji type={icon}/>{(val + '').replace('-', '')}</span>;
    }
};

export default memo(Val);
