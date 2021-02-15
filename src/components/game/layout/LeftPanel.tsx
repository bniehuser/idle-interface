import React, { FC, memo } from 'react';
import EmojiNote from '../interface/EmojiNote';
import Val from '../interface/Val';
import CSS from 'csstype';
import Panel from '../interface/Panel';
import { useGame } from '../../../context/game';
import HeartIcon from '../interface/HeartIcon';
import StarIcon from '../interface/StarIcon';
import Tooltip from '../interface/Tooltip';
import Notification from '../interface/Notification';
import { Scrollbar } from 'react-scrollbars-custom';

const LeftPanel: FC<{ style?: CSS.Properties }> = ({style}) => {

  const [game, dispatch] = useGame();

  return <Panel style={style}>
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <div>
        <div className='money'>money</div>
        <div className='offense'>offense</div>
        <div className='defense'>defense</div>
        <div className='war'>war</div>
        <div className='baby'>baby</div>
        <div className='sun'>sun</div>
        <div className='moon'>moon</div>
        <Tooltip tip={'some tip content here'}><div className={'flash'}><StarIcon style={{fill: '#FFFF66', strokeWidth: '.01rem', stroke: '#000'}}/> star</div></Tooltip>
        <div><HeartIcon style={{fill: '#FF9999', strokeWidth: '.01rem', stroke: '#000'}}/> heart</div>
        <EmojiNote type={'moon'}>Icon</EmojiNote>
        <EmojiNote type={['moon', 'sun', 'baby', 'war']} alt={[undefined, undefined, 'light']}>Icon</EmojiNote>
        <br/><br/>
        <EmojiNote type='money'><Val val={-221}/> from opportunity</EmojiNote>
        <button onClick={() => dispatch({type: 'notify', content: 'padding notes go here', key: 'gear'})}>Add Note</button>
        <br/>
        <button onClick={() => dispatch({type: 'saveGame'})}>Save Game</button>
        <br/>
        <button onClick={() => dispatch({type: 'loadGame'})}>Load Game</button>
        <br/>
      </div>
      <h3>Notifications:</h3>
      <div style={{flex: 1}}>
        <Scrollbar>
        {game.notifications.map((n, i) => <Notification key={`n_${i}`} n={n} p={typeof n.content !== 'string' ? (n.content.person ? game.people[n.content.person] : undefined) : undefined}/>)}
        </Scrollbar>
      </div>
    </div>
  </Panel>;
};

export default memo(LeftPanel);
