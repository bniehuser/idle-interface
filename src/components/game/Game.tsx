import React, { FC } from 'react';
import EmojiNote from './layout/EmojiNote';
import Val from './layout/Val';
import Emoji from './layout/Emoji';

export const Game: FC = () => {
  return <>
    <div className='money'>money</div>
    <div className='offense'>offense</div>
    <div className='defense'>defense</div>
    <div className='war'>war</div>
    <div className='wood'>wood</div>
    <div className='baby'>baby</div>
    <div className='sun'>sun</div>
    <div className='moon'>moon</div>
    <EmojiNote type={'moon'}>Icon</EmojiNote>
    <EmojiNote type={['moon', 'sun', 'baby', 'war']} alt={[undefined, undefined, 'light']}>Icon</EmojiNote>
    <br/><br/>
    <EmojiNote type='money'><Val val={-221}/> from opportunity</EmojiNote>
    <br/>
    <div style={{fontSize: '250%'}}>
      <Emoji type={'baby'} alt={'med'}/>
      <Emoji type={'girl'} alt={'med'}/>
      <Emoji type={'woman'} alt={'med'}/>
      <Emoji type={'old-woman'} alt={'med'}/>
    </div>
    <div style={{fontSize: '250%'}}>
      <Emoji type={'baby'} alt={'dark'}/>
      <Emoji type={'boy'} alt={'dark'}/>
      <Emoji type={'man'} alt={'dark'}/>
      <Emoji type={'old-man'} alt={'dark'}/>
    </div>
    <div style={{fontSize: '250%'}}>
      <Emoji type={'baby'} alt={'med-dark'}/>
      <Emoji type={'girl'} alt={'med-dark'}/>
      <Emoji type={'woman'} alt={'med-dark'}/>
      <Emoji type={'old-woman'} alt={'med-dark'}/>
    </div>
  </>;
};
