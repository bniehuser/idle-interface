import React, { FC, memo } from 'react';
import EmojiNote from '../interface/EmojiNote';
import Val from '../interface/Val';
import CSS from 'csstype';
import Panel from '../interface/Panel';
import { useGameDispatch, useGameStateRef } from '../../../context/game';
import HeartIcon from '../interface/HeartIcon';
import StarIcon from '../interface/StarIcon';
import Tooltip from '../interface/Tooltip';
import NotificationList from '../hud/NotificationList';
import useTimedRefresh from '../../../hooks/useTimedRefresh';
import { Watcher } from '../hud/Watcher';

const LeftPanel: FC<{ style?: CSS.Properties }> = ({style}) => {

  const dispatch = useGameDispatch();
  const sr = useGameStateRef();
  const control = useTimedRefresh(2000);

  return <Panel style={style}>
    <Watcher/>
    <Watcher/>
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', position: 'relative'}}>
      <div>
        <EmojiNote type={'beating-heart'}>Living: {sr.state.people.living.length}</EmojiNote>
        <EmojiNote type={'coffin'}>Dead: {sr.state.people.dead.length}</EmojiNote>
        <Tooltip tip={'some tip content here'}><div className={'flash'}><StarIcon style={{fill: '#FFFF66', strokeWidth: '.01rem', stroke: '#000'}}/> star</div></Tooltip>
        <div><HeartIcon style={{fill: '#FF9999', strokeWidth: '.01rem', stroke: '#000'}}/> heart</div>
        <br/>
        <EmojiNote type='money'><Val val={-221}/> from opportunity</EmojiNote>
        <br/>
        <button onClick={() => dispatch({type: 'notify', content: 'padding notes go here', key: 'gear'})}>Add Note</button>
        <button onClick={() => dispatch({type: 'saveGame'})}>Save Game</button>
        <button onClick={() => dispatch({type: 'loadGame'})}>Load Game</button>
        <button onClick={() => control.pause()}>Pause refresh</button>
        <button onClick={() => control.start()}>Start refresh</button>
        <br/>
      </div>
      <h3>Notifications:</h3>
      <NotificationList/>
    </div>
  </Panel>;
};

export default memo(LeftPanel);
