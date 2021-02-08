import React, { FC } from 'react';

interface PanelProps {
	width?: string|number;
	right?: boolean;
	left?: boolean;
}

const Panel:FC<PanelProps> = ({children, width, right, left}) => {
	return <div style={{width:width, right:(right?0:'default'), left:(left?0:'default'), height:window.innerHeight}} className={'interface panel'}>{children}</div>;
};

export default Panel;