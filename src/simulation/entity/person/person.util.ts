import moment from 'moment';
import femaleNames from '../../../data/names/names-female.json';
import maleNames from '../../../data/names/names-male.json';
import surNames from '../../../data/names/names-surnames.json';
import { YEAR } from '../../../util/const/time';
import { mergeDeep, randArrayItem } from '../../../util/data-access';
import { EmojiKey, htmlEmoji } from '../../../util/emoji';
import { createAI } from '../../component/ai';
import { SimulationState } from '../../state';
import { createPerson, Gender, GENDERS, Person, SKIN_TONES, SkinTone } from './person.state';

export const createRandomPerson = (state: SimulationState, data: Partial<Person> = {}): Person => {
  const gender = randArrayItem(GENDERS);
  const skinTone = randArrayItem(SKIN_TONES);
  const birthday = state.simulationTime - Math.random() * YEAR * 80;
  const age = calcAge(birthday, state.simulationTime);
  return createPerson(mergeDeep<Partial<Person>>({
    gender,
    skinTone,
    birthday,
    age,
    name: {
      given: getRandomGivenName(gender),
      family: getRandomFamilyName(),
    },
    avatar: calcAvatar(gender, skinTone, age),
    ai: createAI({decision: Math.random() < .2 ? 'idle' : 'busy'}),
    location: {
      x: Math.floor(Math.random() * (state.map?.width || 1)),
      y: Math.floor(Math.random() * (state.map?.height || 1)),
    },
  }, data));
};

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

export const calcAvatarProps = (gender: Gender, skinTone: SkinTone, age: number): [EmojiKey, SkinTone] => {
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
  return [emojiKey, skinTone];
};

export const calcAvatar = (gender: Gender, skinTone: SkinTone, age: number): string => {
  return htmlEmoji(...calcAvatarProps(gender, skinTone, age));
};

export const processBirthday = (p: Person, now: number): Partial<Person> => {
  const age = calcAge(p.birthday, now);
  return {age, avatar: calcAvatar(p.gender, p.skinTone, age)};
};
