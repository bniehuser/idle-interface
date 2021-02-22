import { Game } from '../../../../context/game';
import { Person } from '../../../entity/person';

// let's simplify things greatly
export type TNode = (p: Person, g: Game) => boolean;

// Composite
export const Sequence = (...children: TNode[]): TNode => (p, g) => children.every(c => c(p, g));
export const Selector = (...children: TNode[]): TNode => (p, g) => children.some(c => c(p, g));

// Decorator
export const Inverter = (child: TNode): TNode => (p, g) => !child(p, g);
export const Always = (child: TNode): TNode => (p, g) => { child(p, g); return true; };
export const Never = (child: TNode): TNode => (p, g) => { child(p, g); return false; };
export const Repeat = (child: TNode, iterations: number): TNode => (p, g) => {
  let result = false;
  for (let i = 0; i < iterations; i++) {
    result = child(p, g);
  }
  return result;
};

// Generator
export const RandomChance = (chance: number): TNode => () => Math.random() < chance;
