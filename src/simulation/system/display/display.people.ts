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
  const lx = person.location.x / 512;
  const ly = person.location.y / 512;
  const os = 1 / 512;

  return [
    //   // x  y  u  v
    //   -1, -1, 0, 1,
    //   1, -1, 1, 1,
    //   1,  1, 1, 0,
    //
    //   -1, -1, 0, 1,
    //   1,  1, 1, 0,
    //   -1,  1, 0, 0,
    // x, y, u, v -- six vertices for 2 triangles
    lx,      ly,      sizes[0], sizes[3],
    lx + os, ly,      sizes[1], sizes[3],
    lx + os, ly + os, sizes[1], sizes[2],
    lx,      ly,      sizes[0], sizes[3],
    lx + os, ly + os, sizes[1], sizes[2],
    lx,      ly + os, sizes[0], sizes[2],
  ];
};
