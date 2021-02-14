import React, { FC } from 'react';
import moment from 'moment';

const DateNote: FC<{t: Date}> = ({t}) => {
  const mt = moment(t);
  return <div className={'date-note'}>
    {mt.format('MM/DD/yy')}
    <div style={{fontSize: '85%'}}>{mt.format('hh:mm a')}</div>
  </div>;
};

export default DateNote;
