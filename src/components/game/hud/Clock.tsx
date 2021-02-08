import React, { FC } from 'react';
import moment from 'moment';

const Clock:FC<{time:Date}> = ({ time }) => {
	return <div className={'clock'}>{moment(time).format('YYYY-MM-DD h:mm a')}</div>;
};

export default Clock;
