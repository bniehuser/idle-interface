// interface
import { AI, createAI } from '../../component/ai';
import { createSchedule, Schedule } from '../../component/schedule';
import { Entity, EntityStore } from '../entity';
import { MapPoint } from '../map';
import { mergeDeep } from '../../../util/data-access';
import { htmlEmoji } from '../../../util/emoji';

export const GENDERS = ['male', 'female'] as const;
export type Gender = typeof GENDERS[number];

export const SKIN_TONES = ['light', 'med-light', 'med', 'med-dark', 'dark'] as const;
export type SkinTone = typeof SKIN_TONES[number];

export interface Mood {
  happiness: number;
}

export interface PersonStore extends EntityStore<Person> {
  living: number[];
  dead: number[];
}

export interface Person extends Entity {
  name: {
    given: string;
    family: string;
  };
  parent1: number;
  parent2: number;
  skinTone: SkinTone;
  age: number;
  birthday: number;
  gender: Gender;
  avatar: string; // the calculated htmlEmoji
  ai: AI;
  schedule: Schedule;
  mood: Mood;
  relationships: number[];
  location: MapPoint;
}

export const createMood = (data: Partial<Mood> = {}): Mood => mergeDeep({
  happiness: 0,
}, data);

export const createPersonStore = (data: Partial<PersonStore> = {}): PersonStore => mergeDeep({
  id: 0,
  all: {},
  living: [],
  dead: [],
}, data);

export const addPerson = (store: PersonStore, person: Partial<Person>): Person => {
  store.id++;
  store.all[store.id] = createPerson({id: store.id, ...person});
  store.living.push(store.id);
  return store.all[store.id];
};

export const createPerson = (data: Partial<Person> = {}): Person => mergeDeep({
  id: 0,
  name: {
    given: 'Nemo',
    family: 'Niehuser',
  },
  parent1: 0,
  parent2: 0,
  skinTone: 'med',
  age: 0,
  birthday: 0,
  gender: 'male',
  avatar: htmlEmoji('baby', 'med'),
  ai: createAI(),
  schedule: createSchedule(),
  mood: createMood(),
  relationships: [],
  location: {x: 0, y: 0},
}, data);
