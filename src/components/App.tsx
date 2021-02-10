import React from 'react';
import { GameEngine, GameEngineSystem } from 'react-game-engine';

import '../style/style.scss';

import { Game } from './game/Game';
import Clock from './game/hud/Clock';
import Panel from './game/layout/Panel';

let gameTime = new Date('3600-06-01T00:00:00Z');
const TIME_WARP = 1000;

const clockHandler: GameEngineSystem = (entities, {time}) => {
    gameTime.setTime(gameTime.getTime() + (time.delta * TIME_WARP));
    return entities;
};

class App extends React.PureComponent {

    constructor(P: any, S: any) {
        super(P, S);
    }

    render() {
        return (
            <>
                <Panel style={{minWidth: '250px', flexBasis: '300px'}}><Game/></Panel>
                <GameEngine
                    systems={[
                        clockHandler,
                    ]}
                    entities={{
                        'clock': {time: gameTime, renderer: <Clock time={gameTime}/>},
                    }}
                    style={{flexGrow: 4, flex: '', minWidth: '600px', flexBasis: '800px', backgroundColor: '#000'}}>
                </GameEngine>
            </>
        );
    }
}

export default App;
