import { Entity, EntityStore } from './entity';

const relationshipTypes = {
  // family
  grandparent: {},
  parent: {},
  child: {},
  grandchild: {},

  // work
  coworker: {},
  boss: {},
  subordinate: {},
  owner: {},
  employee: {},

  // social
  acquaintance: {},
  friend: {},
  closeFriend: {},
  partner: {},

  // romance
  dating: {},
  lover: {},
  spouse: {},
};
type RelationshipType = keyof typeof relationshipTypes;

export type RelationshipStore = EntityStore<Relationship> & {
  volatile: number[],
  active: number[],
};

export interface Relationship extends Entity {
  type: RelationshipType;
  source: number; // person
  subject: number; // person
  love: number;
  respect: number;
  rivalry: number;
  camaraderie: number;
}

const defaultRelationship: Relationship = {
  id: 0,
  type: 'acquaintance',
  source: 0,
  subject: 0,
  love: 0,
  respect: 0,
  rivalry: 0,
  camaraderie: 0,
};

export const createRelationship = (properties: Partial<Relationship>): Relationship => ({...defaultRelationship, ...properties});
