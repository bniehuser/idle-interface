export interface Entity {
  id: number;
}

export type EntityStore<T extends Entity> = {id: number, all: {[k: number]: T}};
