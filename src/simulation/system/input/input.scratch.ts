import { mergeDeep } from '../../../util/data-access';

export type SimulationInputScratch = {
  mouse: {
    down: boolean,
    x: number,
    y: number,
    scroll: number,
    [k: string]: any,
  },
};

export const createSimulationInputScratch = (data: Partial<SimulationInputScratch> = {}): SimulationInputScratch => mergeDeep({
  mouse: {
    down: false,
    scroll: 0,
    x: 0,
    y: 0,
  },
}, data);
