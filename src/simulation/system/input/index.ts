import { SimulationInputScratch } from './input.scratch';

export * from './input.scratch';

export type HandlerStore = {[k: string]: EventListener};

const normalizeWheelDelta = (wheelEvent: WheelEvent): number => {
  let delta = 0;
  const wheelDelta = ('wheelDelta' in wheelEvent) ? wheelEvent['wheelDelta'] : undefined;
  const deltaY = wheelEvent.deltaY;
  // CHROME WIN/MAC | SAFARI 7 MAC | OPERA WIN/MAC | EDGE
  if (wheelDelta) {
    delta = -wheelDelta / 120;
  }
  // FIREFOX WIN / MAC | IE
  if (deltaY) {
    deltaY > 0 ? delta = 1 : delta = -1;
  }
  return delta;
};

export const createWindowListeners = (inputScratch: SimulationInputScratch): HandlerStore => ({
  'mousedown': () => { inputScratch.mouse.down = true; },
  'mouseup': () => { inputScratch.mouse.down = false; },
  'mousemove': evt => {
    const e = evt as MouseEvent;
    inputScratch.mouse.x = e.clientX;
    inputScratch.mouse.y = e.clientY;
  },
  'wheel': evt => {
    const e = evt as WheelEvent;
    inputScratch.mouse.scroll = normalizeWheelDelta(e);
  },
});

export const enableInput = (listeners: HandlerStore) => Object.keys(listeners).forEach(k => window.addEventListener(k, listeners[k]));
export const disableInput = (listeners: HandlerStore) => Object.keys(listeners).forEach(k => window.removeEventListener(k, listeners[k]));
