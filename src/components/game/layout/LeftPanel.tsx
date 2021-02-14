import React, { FC, memo } from 'react';
import EmojiNote from '../interface/EmojiNote';
import Val from '../interface/Val';
import CSS from 'csstype';
import Panel from '../interface/Panel';
import { useGameState } from '../../../context/game';
import DateNote from '../interface/DateNote';

const LeftPanel: FC<{ style?: CSS.Properties }> = ({style}) => {

  const game = useGameState();

  return <Panel style={style}>
    <div className='money'>money</div>
    <div className='offense'>offense</div>
    <div className='defense'>defense</div>
    <div className='war'>war</div>
    <div className='baby'>baby</div>
    <div className='sun'>sun</div>
    <div className='moon'>moon</div>
    <EmojiNote type={'moon'}>Icon</EmojiNote>
    <EmojiNote type={['moon', 'sun', 'baby', 'war']} alt={[undefined, undefined, 'light']}>Icon</EmojiNote>
    <br/><br/>
    <EmojiNote type='money'><Val val={-221}/> from opportunity</EmojiNote>
    <br/>
    {/*<div style={{fontSize: '250%'}}>*/}
    {/*  <Emoji type={'baby'} alt={'med'}/>*/}
    {/*  <Emoji type={'girl'} alt={'med'}/>*/}
    {/*  <Emoji type={'woman'} alt={'med'}/>*/}
    {/*  <Emoji type={'old-woman'} alt={'med'}/>*/}
    {/*</div>*/}
    {/*<div style={{fontSize: '250%'}}>*/}
    {/*  <Emoji type={'baby'} alt={'dark'}/>*/}
    {/*  <Emoji type={'boy'} alt={'dark'}/>*/}
    {/*  <Emoji type={'man'} alt={'dark'}/>*/}
    {/*  <Emoji type={'old-man'} alt={'dark'}/>*/}
    {/*</div>*/}
    {/*<div style={{fontSize: '250%'}}>*/}
    {/*  <Emoji type={'baby'} alt={'med-dark'}/>*/}
    {/*  <Emoji type={'girl'} alt={'med-dark'}/>*/}
    {/*  <Emoji type={'woman'} alt={'med-dark'}/>*/}
    {/*  <Emoji type={'old-woman'} alt={'med-dark'}/>*/}
    {/*</div>*/}
    <h3>Notifications:</h3>
    {game.notifications.map((n, i) =>
      <div key={`n_${i}`} style={{display: 'flex', fontSize: '85%', marginBottom: '.25rem'}}><DateNote t={n.at}/>
        <EmojiNote type={n.type}>{n.content}</EmojiNote>
      </div>,
    )}
  </Panel>;
};

export default memo(LeftPanel);
