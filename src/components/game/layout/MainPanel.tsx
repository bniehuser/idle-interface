import CSS from 'csstype';
import React, { FC, memo } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Settings } from '../container/Settings';
import { Stats } from '../container/Stats';
import { TileBuilder } from '../container/tile-builder/TileBuilder';
import { VoronoiUI } from '../container/tile-builder/Voronoi';
import Simulation from '../SimulationUI';

const MainPanel: FC<{ style: CSS.Properties }> = ({style}) => {

  const { path } = useRouteMatch();
  return <Switch>
    <Route path={path} exact><Simulation style={style}/></Route>
    <Route path={`${path}/settings`}><Settings/></Route>
    <Route path={`${path}/stats`}><Stats/></Route>
    <Route path={`${path}/tile-builder`}><TileBuilder/></Route>
    <Route path={`${path}/voronoi`}><VoronoiUI/></Route>
  </Switch>;
};

export default memo(MainPanel);
