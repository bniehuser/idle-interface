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
            <>
				<Game/>
            <GameEngine
                systems={[
					clockHandler,
                ]}
                entities={{
				    'clock': {time:gameTime, position:[0,0],renderer:<Clock time={gameTime}/>}
				}}
                style={{width:800,height:600,backgroundColor:'black'}} onUpdate={() => {}}/>
                </>
        );
    }
}

export default App;