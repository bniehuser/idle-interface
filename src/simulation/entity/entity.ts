export interface Entity {
  id: number;
}

export interface EntityScratch {
  // empty for now
}

export type EntityStore<T extends Entity> = {id: number, all: {[k: number]: T}};
