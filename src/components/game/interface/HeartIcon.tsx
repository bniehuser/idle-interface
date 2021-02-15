import React, { FC } from 'react';
import CSS from 'csstype';

const HeartIcon: FC<{style: CSS.Properties}> = ({style}) => {
  return <svg className='svg-icon' style={style} viewBox='0 0 20 20'>
    <path d={'M10,17.6625c0,0-8.75-4.95375-8.75-10.65375c0-5.8475,8.224375-6.499375,8.75-0.28375c0.631875-6.21125,8.75-5.564375,8.75,0.28375C18.75,12.709375,10,17.663125,10,17.663125z'}/>
  </svg>;
};
export default HeartIcon;
