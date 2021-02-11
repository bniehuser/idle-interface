import React, { FC, memo, ReactNode } from 'react';
import CSS from 'csstype';

interface PanelProps {
  width?: string|number;
  right?: boolean;
  left?: boolean;
  style?: CSS.Properties;
  children?: ReactNode;
}

const Panel: FC<PanelProps> = ({children, style}) => {
  return <div
    style={{...style}}
    className={'container sidebar'}
  ><div className={'interface'}>{children}</div></div>;
};

export default memo(Panel);
