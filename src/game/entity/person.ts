import { AI } from '../component/ai';
import { Schedule } from '../component/schedule';
import { NameQualifier } from '../../util/names';
import { data as maleNames } from '../../data/names/names-male.json';
import { data as femaleNames } from '../../data/names/names-female.json';
import { data as surNames } from '../../data/names/names-surnames.json';
import moment from 'moment';
import { randArrayItem } from '../../util/data-access';
import { EmojiKey, htmlEmoji } from '../../util/emoji';

export interface Person {
  id: number;
  name: {
    given: string;
    family: string;
  };
  skinTone: SkinTone;
  age: number;
  birthday: number;
  gender: Gender;
  avatar: string;
  ai: AI;
  schedule: Schedule;
  mood: Mood;
  relationships: Array<Relationship>;
}

export interface Mood {
  happiness: number;
}

export interface Relationship {
  source: number; // person
  subject: number; // person
  love: number;
  respect: number;
  rivalry: number;
  camaraderie: number;
}

let PERSON_ID = 0;

export const getNewPersonId = () => {
  return PERSON_ID++;
};

export const getRandomGivenName = (gender: NameQualifier) => {
  switch (gender) {
    case 'male':
      return randArrayItem(maleNames);
    case 'female':
      return randArrayItem(femaleNames);
    default:
      return 'Androgynous';
  }
};

export const getRandomFamilyName = () => {
  return randArrayItem(surNames);
};

export const calcAge = (birthday: number, now: number) => {
  return moment(now).diff(moment(birthday), 'years');
};

export const calcAvatar = (gender: Gender, skinTone: SkinTone, age: number) => {
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

export const processBirthday = (p: Person, now: number) => {
  const age = calcAge(p.birthday, now);
  return {age, avatar: calcAvatar(p.gender, p.skinTone, age)};
};

const genders = ['male', 'female'] as const;
type Gender = typeof genders[number];

const skinTones = ['light', 'med-light', 'med', 'med-dark', 'dark'] as const;
type SkinTone = typeof skinTones[number];

export const createPerson = (now: number, birthday: number, gender?: Gender, parent1?: Person, parent2?: Person): Person => {
  const useGender = gender || randArrayItem(genders);
  const useSkin = randArrayItem(skinTones);
  const useAge = calcAge(birthday, now);
  const child: Person = {
    id: getNewPersonId(),
    birthday,
    name: {
      given: getRandomGivenName(useGender),
      family: parent1?.name.family || getRandomFamilyName(),
    },
    skinTone: useSkin,
    gender: useGender,
    avatar: calcAvatar(useGender, useSkin, useAge),
    age: useAge,
    ai: { decision: '' },
    mood: { happiness: 0 },
    relationships: [],
    schedule: {obligations: []},
  };
  if (parent1) {
    child.relationships.push({source: child.id, subject: parent1.id, love: 1, respect: 1, camaraderie: 0, rivalry: 0});
    parent1.relationships.push({source: parent1.id, subject: child.id, love: 1, respect: 0, camaraderie: .25, rivalry: .25});
  }
  if (parent2) {
    child.relationships.push({source: child.id, subject: parent2.id, love: 1, respect: 1, camaraderie: 0, rivalry: 0});
    parent2.relationships.push({source: parent2.id, subject: child.id, love: 1, respect: 0, camaraderie: .25, rivalry: .25});
  }
  return child;
};
