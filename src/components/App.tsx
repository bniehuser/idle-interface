import React from 'react';
import {GameEngine} from 'react-game-engine';

import '../style/style.scss';

import { Game } from './game/Game';
import Clock from './game/hud/Clock';

type GameSystemEntity = any;
type GameSystemArgs = {
    time: {
        current: number,
        delta: number,
        previous: number,
		previousDelta: number,
    };
}
type GameSystemHandler = (entities: GameSystemEntity[], args: GameSystemArgs) => GameSystemEntity[];

let gameTime = new Date('3600-06-01T00:00:00Z');

const clockHandler:GameSystemHandler = (entities, { time }) => {
    gameTime.setTime(gameTime.getTime()+(time.delta*1000));
    //console.log(newTime.toISOString());
    return entities;
};

class App extends React.PureComponent {
    constructor(P: any, S: any) {
        super(P, S);

    }
    render() {
        return (
            <GameEngine
                systems={[
					clockHandler,
                ]}
                entities={{
				    'clock': {renderer:<Clock time={gameTime}/>}
				}}
                style={{width:window.innerWidth,height:window.innerHeight,backgroundColor:'black'}} onUpdate={() => {}}>
				<Game/>
                </GameEngine>
        );
    }
}

export default App;