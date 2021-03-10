import { mergeDeep } from '../../util/data-access';

export const states = {
  'busy': {},
  'idle': {},
  'alert': {},
};
type AIStatus = keyof typeof states;

export const activities = {
  all: {
    'sleeping': {},
    'eating': {},
  },
};
type AIActivity = keyof typeof activities.all;

export interface AI {
  decision: string;
  status?: AIStatus;
  doing?: AIActivity;
  thinking?: AIActivity;
  planning?: AIActivity;
  dreaming?: AIActivity;
}

export const createAI = (data: Partial<AI> = {}): AI => mergeDeep({
  decision: 'unknown',
}, data);