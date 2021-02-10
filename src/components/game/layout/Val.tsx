import React, { FC } from 'react';

interface IValProps {
    val: number;
}

const Val: FC<IValProps> = ({val}) => {
    return <span className={val > 0 ? 'pos' : 'neg'}>{Math.abs(val)}</span>;
};

export default Val;