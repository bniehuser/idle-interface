import { Person } from '../../entity/person';

// size of a single person image display in atlas, fractional to whole for uv purposes
const PERSON_TEX_SIZE: [number, number] = [0, 0];
export const setPersonTexSize = (x: number, y: number) => {
  PERSON_TEX_SIZE[0] = x;
  PERSON_TEX_SIZE[1] = y;
};

// could cast immediately to float32 array, but since we'll be throwing them all in a single array why bother
export const getPersonPosArray = (person: Person, texOffset: [number, number] = [0, 0]): number[] => {
  const sizes = [texOffset[0] * PERSON_TEX_SIZE[0], (texOffset[0] + 1) * PERSON_TEX_SIZE[0], texOffset[1] * PERSON_TEX_SIZE[1], (texOffset[1] + 1) * PERSON_TEX_SIZE[1]];
  return [
    // x, y, u, v -- six vertices for 2 triangles
    person.location.x,     person.location.y,     sizes[0], sizes[2],
    person.location.x + 1, person.location.y,     sizes[1], sizes[2],
    person.location.x + 1, person.location.y + 1, sizes[1], sizes[3],
    person.location.x,     person.location.y,     sizes[0], sizes[2],
    person.location.x + 1, person.location.y + 1, sizes[1], sizes[3],
    person.location.x,     person.location.y + 1, sizes[0], sizes[3],
  ];
};
