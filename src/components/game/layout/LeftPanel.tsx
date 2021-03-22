import CSS from 'csstype';
import React, { FC, memo } from 'react';
import { useHourly } from '../../../hooks/simulation';
import NotificationList from '../hud/NotificationList';
import { Menu } from '../interface/Menu';
import Panel from '../interface/Panel';

const LeftPanel: FC<{ style?: CSS.Properties }> = ({style}) => {

  useHourly(undefined, true);

  return <Panel style={style}>
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', position: 'relative'}}>
      <div>
        <h1 style={{margin: '.25em 0'}}>Idle Sim <span style={{fontSize: '40%'}}>v0.0.1-alpha</span></h1>
        <Menu/>
        {/*<Tooltip tip={'some tip content here'}>*/}
        {/*  <div className={'flash'}><StarIcon style={{fill: '#FFFF66', strokeWidth: '.01rem', stroke: '#000'}}/> star*/}
        {/*  </div>*/}
        {/*</Tooltip>*/}
        {/*<div><HeartIcon style={{fill: '#FF9999', strokeWidth: '.01rem', stroke: '#000'}}/> heart</div>*/}
        {/*<br/>*/}
        {/*<br/>*/}
      </div>
      <h3>Notifications:</h3>
      <NotificationList/>
    </div>
  </Panel>;
};

export default memo(LeftPanel);
