import moment from 'moment';
import femaleNames from '../../data/names/names-female.json';
import maleNames from '../../data/names/names-male.json';
import surNames from '../../data/names/names-surnames.json';
import { YEAR } from '../../util/const/time';
import { randArrayItem } from '../../util/data-access';
import { EmojiKey, htmlEmoji } from '../../util/emoji';
import { AI } from '../component/ai';
import { Schedule } from '../component/schedule';
import { Entity, EntityStore } from './entity';
import { Map, MapPoint } from './map';
import { createRelationship, Relationship, RelationshipStore } from './relationship';

const genders = ['male', 'female'] as const;
type Gender = typeof genders[number];

const skinTones = ['light', 'med-light', 'med', 'med-dark', 'dark'] as const;
type SkinTone = typeof skinTones[number];

// interface
export interface Person_old extends Entity {
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

export interface Mood {
  happiness: number;
}

export interface PeopleStore extends EntityStore<Person_old> {
  living: number[];
  dead: number[];
}

export type PersonEntities = {
  people: PeopleStore,
  relationships: RelationshipStore,
};

// defaults
const defaultPerson: Person_old = {
  id: 0,
  name: { given: '', family: '' },
  parent1: 0,
  parent2: 0,
  skinTone: 'med',
  age: 0,
  birthday: 0,
  gender: 'male',
  avatar: 'baby',
  ai: { decision: 'idle' },
  schedule: {},
  mood: { happiness: 0 },
  relationships: [],
  location: { x: 0, y: 0 },
};

export const createRandomPerson = (now: number, map?: Map, properties: Partial<Person_old> = {}): Person_old => {
  properties.gender = properties.gender || randArrayItem(genders);
  properties.skinTone = properties.skinTone || randArrayItem(skinTones);
  properties.birthday = properties.birthday || now - Math.random() * YEAR * 80;
  properties.age = calcAge(properties.birthday, now);
  properties.name = { ...properties.name, given: (properties.name?.given || getRandomGivenName(properties.gender as Gender)), family: (properties.name?.family || getRandomFamilyName()) };
  properties.avatar = calcAvatar(properties.gender as Gender, properties.skinTone as SkinTone, properties.age);
  properties.ai = {...properties.ai, decision: properties.ai?.decision || (Math.random() < .2 ? 'idle' : 'busy') };
  properties.location = {
    ...properties.location,
    x: properties.location?.x !== undefined ? properties.location.x : Math.floor(Math.random() * (map?.width || 100)),
    y: properties.location?.y !== undefined ? properties.location.y : Math.floor(Math.random() * (map?.height || 100)),
  };
  return createPerson(properties);
};

export const createParentChildRelationships = (parent: Person_old, child: Person_old): Relationship[] => {
  return [createRelationship({
    type: 'parent',
    source: child.id,
    subject: parent.id,
    love: 1,
    respect: 1,
  }), createRelationship({
    type: 'child',
    source: parent.id,
    subject: child.id,
    love: 1,
    camaraderie: .15,
    rivalry: .15,
  })];
};

// create
export const createPerson = (properties: Partial<Person_old>): Person_old => ({...defaultPerson, ...properties});

// util
export const getRandomGivenName = (gender: Gender) => {
  switch (gender) {
    case 'male':
      return randArrayItem(maleNames.data);
    case 'female':
      return randArrayItem(femaleNames.data);
    default:
      return 'Androgynous';
  }
};

export const getRandomFamilyName = () => {
  return randArrayItem(surNames.data);
};

export const calcAge = (birthday: number, now: number) => {
  return moment(now).diff(moment(birthday), 'years');
};

export const calcAvatar = (gender: Gender, skinTone: SkinTone, age: number): string => {
  let emojiKey: EmojiKey;
  if (age < 5) {
    emojiKey = 'baby';
  } else if (age < 18) {
    emojiKey = gender === 'male' ? 'boy' : 'girl';
  } else if (age < 50) {
    emojiKey = gender === 'male' ? 'man' : 'woman';
  } else {
    emojiKey = gender === 'male' ? 'old-man' : 'old-woman';
  }
  return htmlEmoji(emojiKey, skinTone);
};

export const processBirthday = (p: Person_old, now: number): Partial<Person_old> => {
  const age = calcAge(p.birthday, now);
  return {age, avatar: calcAvatar(p.gender, p.skinTone, age)};
};
