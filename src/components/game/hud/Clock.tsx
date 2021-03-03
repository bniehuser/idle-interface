import moment from 'moment';
import React, { FC } from 'react';
import { useMomentary } from '../../../hooks/simulation';
import Simulation from '../../../simulation';

const Clock: FC = () => {
  useMomentary(undefined, true);
  return <div className={'clock'}>{moment(Simulation.scratch.processTime).format('YYYY-MM-DD h:mm a')}</div>;
};

export default Clock;
