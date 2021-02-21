import React, { FC, memo } from 'react';

interface ProgressProps {
  min?: number;
  max?: number;
  current?: number;
  minLabel?: string;
  maxLabel?: string;
  currentLabel?: string;
  color?: string;
  type?: string;
  labelType?: string;
}

const Progress: FC<ProgressProps> = ({minLabel, maxLabel, currentLabel, min = 0, max = 100, current = 0, color = '#FFF', type = 'default', labelType = ''}) => {
  const width = (((current - min) / (max - min)) * 100) + '%';
  return <div style={{position: 'relative', display: 'inline-block'}}><div className={'progress-bar ' + type}>
    {minLabel && <span className={'progress-min-label ' + type + ' ' + labelType}>{minLabel}</span>}
    <div className={'progress-current'} style={{width, backgroundColor: color}}>
      {currentLabel && <span className={'progress-current-label ' + type + ' ' + labelType}>{currentLabel}</span>}
    </div>
    {maxLabel && <span className={'progress-max-label ' + type + ' ' + labelType}>{maxLabel}</span>}
  </div></div>;
};

export default memo(Progress);
