import React, { FC } from 'react';
import CSS from 'csstype';

interface PanelProps {
  width?: string|number;
  right?: boolean;
  left?: boolean;
  style?: CSS.Properties;
}

const Panel: FC<PanelProps> = ({children, style}) => {
  return <div
    style={{...style}}
    className={'container sidebar'}
  ><div className={'interface'}>{children}</div></div>;
};

export default Panel;
