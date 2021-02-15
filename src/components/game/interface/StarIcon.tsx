import React, { FC } from 'react';
import CSS from 'csstype';

const StarIcon: FC<{style: CSS.Properties}> = ({style}) => {
  return <svg className='svg-icon' style={style} viewBox='0 0 20 20'>
    <path  d={'M 10.000 14.500 L 15.878 18.090 L 14.280 11.391 L 19.511 6.910 L 12.645 6.359 L 10.000 0.000 L 7.355 6.359 L 0.489 6.910 L 5.720 11.391 L 4.122 18.090 L 10.000 14.500'}/>
  </svg>;
};
export default StarIcon;
