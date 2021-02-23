import React, { FC, memo, MouseEvent, ReactNode, useCallback, useState } from 'react';
import TooltipContent from './TooltipContent';

type TTProps = {
  children?: ReactNode;
  tip: ReactNode;
  noFormat?: boolean;
};
type TipParams = {
  show: boolean;
  h?: 'left'|'right';
  v?: 'top'|'middle'|'bottom';
};

const Tooltip: FC<TTProps> = ({tip, children, noFormat}) => {
  const [tipData, setTip] = useState<TipParams>({show: false});

  const mouseOver = useCallback((e: MouseEvent) => {
    const h = e.clientX >= (window.innerWidth / 2) ? 'right' : 'left';
    const v = e.clientY >= (window.innerHeight / 3) ? (e.clientY >= ((window.innerHeight / 3) * 2) ? 'bottom' : 'middle') : 'top';
    setTip({show: true, h, v});
  }, []);

  return <span className={'tooltipContainer'} onMouseOver={mouseOver} onMouseOut={() => setTip({show: false})}>
    {children}
    {tipData.show && <TooltipContent noFormat={noFormat} h={tipData.h} v={tipData.v}>{tip}</TooltipContent>}
  </span>;
};
export default memo(Tooltip);
