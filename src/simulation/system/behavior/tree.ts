// let's simplify things greatly
export type BehaviorNode = (...args: any) => boolean;
export type PersonNode = (id: number) => boolean;

// Composite
export const Sequence = (...children: BehaviorNode[]): BehaviorNode => (...args) => children.every(c => c(...args));
export const Selector = (...children: BehaviorNode[]): BehaviorNode => (...args) => children.some(c => c(...args));

// Decorator
export const Inverter = (child: BehaviorNode): BehaviorNode => (...args) => !child(...args);
export const Always = (child: BehaviorNode): BehaviorNode => (...args) => { child(...args); return true; };
export const Never = (child: BehaviorNode): BehaviorNode => (...args) => { child(...args); return false; };
export const Repeat = (child: BehaviorNode, iterations: number): BehaviorNode => (...args) => {
  let result = false;
  for (let i = 0; i < iterations; i++) {
    result = child(...args);
  }
  return result;
};

// Generator
export const RandomChance = (chance: number): BehaviorNode => () => Math.random() < chance;
