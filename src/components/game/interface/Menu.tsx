import React, { FC } from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';

export const Menu: FC = () => {
  const {path} = useRouteMatch();
  return <ul className={'simpleMenu'}>
    <li><NavLink activeClassName='selected' exact to={path}>Map</NavLink></li>
    <li><NavLink activeClassName='selected' exact to={`${path}/settings`}>Settings</NavLink></li>
    <li><NavLink activeClassName='selected' exact to={`${path}/stats`}>Stats</NavLink></li>
    <li><NavLink activeClassName='selected' exact to={`${path}/tile-builder`}>Tile Builder</NavLink></li>
    <li><NavLink activeClassName='selected' exact to={`${path}/voronoi`}>Voronoi</NavLink></li>
  </ul>;
};
