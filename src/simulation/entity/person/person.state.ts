// interface
import { AI } from '../../component/ai';
import { Schedule } from '../../component/schedule';
import { Entity } from '../entity';
import { MapPoint } from '../map';
import { Mood } from '../person';

const genders = ['male', 'female'] as const;
export type Gender = typeof genders[number];

const skinTones = ['light', 'med-light', 'med', 'med-dark', 'dark'] as const;
type SkinTone = typeof skinTones[number];

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
