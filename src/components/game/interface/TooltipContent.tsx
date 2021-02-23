import React, { FC, memo, ReactNode } from 'react';

type TCProps = {
  children: ReactNode;
  noFormat?: boolean;
  v?: 'top'|'middle'|'bottom';
  h?: 'left'|'right';
};

const TooltipContent: FC<TCProps> = ({v, h, children, noFormat}) => {
  return <div style={{position: 'absolute', top: '50%', ...(h === 'right' ? {right: '105%'} : {left: '105%'})}}>
    <div className={noFormat ? '' : 'interface'} style={{position: 'relative', display: 'block', transform: `translateY(${v === 'top' ? '0%' : (v === 'bottom' ? '-100%' : '-50%')})`}}>
      {children}
    </div>
  </div>;
};
export default memo(TooltipContent);
