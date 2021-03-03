import moment from 'moment';
import Simulation from '../index';
import { DailyTree, HourlyTree, MomentaryTree } from './behavior';

export const momentaryAI = (): void => {
    Object.values(Simulation.state.people.living).forEach(id => MomentaryTree(id));
};

export const hourlyAI = (): void => {
    Object.values(Simulation.state.people.living).forEach(id => HourlyTree(id));
    console.log('resolving hourly...');
};

export const dailyAI = (): void => {
    Object.values(Simulation.state.people.living).forEach(id => DailyTree(id));
    console.log('resolving daily...', moment(Simulation.scratch.processTime).dayOfYear(), Simulation.scratch.processTime, Simulation.scratch.lastSimulationTime);
};
