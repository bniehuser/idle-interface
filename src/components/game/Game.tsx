import React, { FC } from 'react';
import Panel from './hud/Panel';

export const Game:FC = () => {
	return <Panel width={'33%'} right={true}>
		<div className="money">money</div>
		<div className="offense">offense</div>
		<div className="offense alt">offense</div>
		<div className="war">war</div>
		<div className="war alt">war</div>
		<div className="defense">defense</div>
		<div className="defense alt">defense</div>
	</Panel>;
};