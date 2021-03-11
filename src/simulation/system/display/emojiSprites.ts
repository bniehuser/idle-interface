import { htmlEmoji } from '../../../util/emoji';
import { OS } from '../../../util/platform';

const bigIcons = [
  htmlEmoji('baby', 'light'),
  htmlEmoji('baby', 'med-light'),
  htmlEmoji('baby', 'med'),
  htmlEmoji('baby', 'med-dark'),
  htmlEmoji('baby', 'dark'),
  htmlEmoji('boy', 'light'),
  htmlEmoji('boy', 'med-light'),
  htmlEmoji('boy', 'med'),
  htmlEmoji('boy', 'med-dark'),
  htmlEmoji('boy', 'dark'),
  htmlEmoji('girl', 'light'),
  htmlEmoji('girl', 'med-light'),
  htmlEmoji('girl', 'med'),
  htmlEmoji('girl', 'med-dark'),
  htmlEmoji('girl', 'dark'),
  htmlEmoji('man', 'light'),
  htmlEmoji('man', 'med-light'),
  htmlEmoji('man', 'med'),
  htmlEmoji('man', 'med-dark'),
  htmlEmoji('man', 'dark'),
  htmlEmoji('woman', 'light'),
  htmlEmoji('woman', 'med-light'),
  htmlEmoji('woman', 'med'),
  htmlEmoji('woman', 'med-dark'),
  htmlEmoji('woman', 'dark'),
  htmlEmoji('old-man', 'light'),
  htmlEmoji('old-man', 'med-light'),
  htmlEmoji('old-man', 'med'),
  htmlEmoji('old-man', 'med-dark'),
  htmlEmoji('old-man', 'dark'),
  htmlEmoji('old-woman', 'light'),
  htmlEmoji('old-woman', 'med-light'),
  htmlEmoji('old-woman', 'med'),
  htmlEmoji('old-woman', 'med-dark'),
  htmlEmoji('old-woman', 'dark'),
];
const smallIcons = [
  htmlEmoji('speech'),
  htmlEmoji('yell'),
  htmlEmoji('thought'),
];

export const spriteOffs = (main: string, sub: string): [number, number] => {
  let xoffs = 0;
  switch (main) {
    case 'baby': xoffs += 0; break;
    case 'boy': xoffs += 5; break;
    case 'girl': xoffs += 10; break;
    case 'man': xoffs += 15; break;
    case 'woman': xoffs += 20; break;
    case 'old-man': xoffs += 25; break;
    case 'old-woman': xoffs += 30; break;
    default:
      console.log('searched for emoji, not found', main);
  }
  switch (sub) {
    case 'light': xoffs += 0; break;
    case 'med-light': xoffs += 1; break;
    case 'med': xoffs += 2; break;
    case 'med-dark': xoffs += 3; break;
    case 'dark': xoffs += 4; break;
    default:
      console.log('searched for emoji sub, not found', sub);
  }
  return [xoffs, 0];
};

type SpriteDimensions = {x: number, y: number, h: number, w: number};
type SpriteInfo = {[k: string]: SpriteDimensions};

const spriteInfo: SpriteInfo = {
  ...bigIcons.reduce((a, c, i) => {
    a[c] = {x: i * 32, y: 0, h: 32, w: 32};
    return a;
  }, {} as SpriteInfo),
  ...smallIcons.reduce((a, c, i) => {
    a[c] = {x: i * 16, y: 32, h: 16, w: 16};
    return a;
  }, {} as SpriteInfo),
};

const spriteBufferCanvas = document.createElement('canvas');
spriteBufferCanvas.height = 48;
spriteBufferCanvas.width = Math.max(bigIcons.length * 32, smallIcons.length * 16);

export const initEmojiSpriteBuffer = () => {
  const ctx = spriteBufferCanvas.getContext('2d');
  if (ctx) {
    Object.keys(spriteInfo).forEach(k => {
      const s = spriteInfo[k];
      // TODO: extrapolate a set of emoji characteristics by OS in the emoji util
      const emojiHeight = OS === 'Windows' ? 25 : 32;
      const h = (s.h === 16 ? 14 : emojiHeight);
      ctx.font = h + 'px sans-serif';
      ctx.fillText(k, s.x, s.y + h - 1); // fonts are baseline, so print at bottom
    });
  } else {
    console.error('NO SPRITE CANVAS CONTEXT');
  }
  return spriteBufferCanvas;
};
