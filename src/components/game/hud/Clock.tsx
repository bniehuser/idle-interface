import moment from 'moment';
import React, { FC } from 'react';
import { useMomentary } from '../../../hooks/simulation';
import Simulation from '../../../simulation';
import { HOUR } from '../../../util/const/time';

const HALF_DAY = HOUR * 12;

const Clock: FC = () => {
  useMomentary(undefined, true);
  const m = moment(Simulation.scratch.processTime);
  // const dayMS = m.diff(m.clone().startOf('day'), 'ms');
  // const hr = ((dayMS % HALF_DAY) / HALF_DAY) * 360;
  // const mr = ((dayMS % HOUR) / HOUR) * 360;
  return <>
    <div className={'clock'}>{m.format('YYYY-MM-DD h:mm a')}</div>
    {/*<svg className={'clock'} style={{marginTop: '2em', marginRight: '1em', background: 'transparent', borderRadius: '50%', boxShadow: '0 0 .25em rgba(32, 32, 32, .5)'}} id={'clock'} viewBox={'0 0 200 200'} width={100} height={100}>*/}
    {/*  <circle cx={100} cy={100} r={100} stroke={'#000'} fill={'#fff'}/>*/}
    {/*  <line x1={100} y1={100} x2={100} y2={10} stroke={'#000'} strokeWidth={'.24em'} transform={`rotate(${mr}, 100, 100)`}/>*/}
    {/*  <line x1={100} y1={100} x2={100} y2={50} stroke={'#000'} strokeWidth={'.3em'} transform={`rotate(${hr}, 100, 100)`}/>*/}
    {/*</svg>*/}
  </>;
};

export default Clock;
