import React, { FC, memo } from 'react';
import { BrowserRouter, Redirect, Route } from 'react-router-dom';
import { GameProvider } from '../context/game';

import '../style/style.scss';
import LeftPanel from './game/layout/LeftPanel';
import MainPanel from './game/layout/MainPanel';
import Modals from './game/layout/Modals';

const App: FC = () => {
  return <GameProvider>
    <BrowserRouter>
      <Route exact path={'/'} render={() => <Redirect to={'/simulation'}/>}/>
      <Route path={'/simulation'}>
        <LeftPanel style={{minWidth: '250px', flexBasis: '400px'}}/>
        <MainPanel style={{flexGrow: 4, flex: '', minWidth: '600px', flexBasis: '800px', backgroundColor: '#000'}}/>
        <Modals/>
      </Route>
    </BrowserRouter>
  </GameProvider>;
};

export default memo(App);
