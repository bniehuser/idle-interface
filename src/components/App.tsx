import React, { FC, memo } from 'react';

import '../style/style.scss';
import LeftPanel from './game/layout/LeftPanel';
import MainPanel from './game/layout/MainPanel';
import { GameProvider } from '../context/game';

const App: FC = () => {
  return <GameProvider>
    <LeftPanel style={{minWidth: '250px', flexBasis: '300px'}}/>
    <MainPanel style={{flexGrow: 4, flex: '', minWidth: '600px', flexBasis: '800px', backgroundColor: '#000'}}/>
  </GameProvider>;
};

export default memo(App);
