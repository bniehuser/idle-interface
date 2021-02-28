import { DailyTree } from './ai/behavior';
import Simulation from '../index';

export const dailyAI = (): void => {
    Object.values(Simulation.state.people.living).forEach((id) => {
        DailyTree(id);
    });
    console.log('resolving daily...', day, game.blackboard.processTime, game.blackboard.processLastTime);
};

