import React, { FC } from 'react';
import { useGameStateRef } from '../../../context/game';
import Notification from '../interface/Notification';
import useTimedRefresh from '../../../hooks/useTimedRefresh';

const NotificationList: FC = () => {

  const sr = useGameStateRef();
  useTimedRefresh(200);

  return sr.state.fastForward ? <div>Loading...</div> : <div className={'scrollable'} style={{flex: 1}}>
    {sr.state.notifications?.map((n, i) => <Notification key={`n_${i}`} n={n} p={typeof n.content !== 'string' ? (n.content.person ? sr.state.people.all[n.content.person] : undefined) : undefined}/>)}
  </div>;
};

export default NotificationList;
