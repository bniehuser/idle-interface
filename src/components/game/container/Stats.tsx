import moment from 'moment';
import React, { FC } from 'react';
import { useMomentary } from '../../../hooks/simulation';
import Simulation from '../../../simulation';
import EmojiNote from '../interface/EmojiNote';

export const Stats: FC = () => {
  useMomentary(undefined, true);
  return <div className={'interface'}>
    <h1>Stats</h1>
    <table>
      <thead>
        <tr>
          <th>Stat</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><EmojiNote type={'fancy-clock'}>Game Started</EmojiNote></td>
          <td>{moment(Simulation.state.realStart).format('YYYY.MM.DD hh:mm:ss')}</td>
        </tr>
        <tr>
          <td><EmojiNote type={'beating-heart'}>Living</EmojiNote></td>
          <td>{Simulation.state.people.living.length}</td>
        </tr>
        <tr>
          <td><EmojiNote type={'coffin'}>Dead</EmojiNote></td>
          <td>{Simulation.state.people.dead.length}</td>
        </tr>
      </tbody>
    </table>
  </div>;
};
