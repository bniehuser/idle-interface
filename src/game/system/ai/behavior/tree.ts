// let's simplify things greatly
export type TNode = (id?: number) => boolean;

// Composite
export const Sequence = (...children: TNode[]): TNode => id => children.every(c => c(id));
export const Selector = (...children: TNode[]): TNode => id => children.some(c => c(id));

// Decorator
export const Inverter = (child: TNode): TNode => id => !child(id);
export const Always = (child: TNode): TNode => id => { child(id); return true; };
export const Never = (child: TNode): TNode => id => { child(id); return false; };
export const Repeat = (child: TNode, iterations: number): TNode => id => {
  let result = false;
  for (let i = 0; i < iterations; i++) {
    result = child(id);
  }
  return result;
};

// Generator
export const RandomChance = (chance: number): TNode => () => Math.random() < chance;
