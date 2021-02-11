import React, { FC, memo } from 'react';
import CSS from 'csstype';
import Game from '../Game';

const MainPanel: FC<{ style: CSS.Properties }> = ({style}) => {
  return <Game style={style}/>;
};

export default memo(MainPanel);
