export const emojis = {
    'money': 0x01F4B0,
    'offense': 0x01F5E1,
    'defense': 0x01F6E1,
    'war': 0x2694,
    'farm': 0x01F4B0,
    'love': 0x01F4B0,
    'baby': 0x01F476,
    'boy': 0x01F466,
    'girl': 0x01F467,
    'man': 0x01F468,
    'woman': 0x01F469,
    'old-man': 0x01F474,
    'old-woman': 0x01F475,
    'wood': 0x1FAB5,
    'sun': 0x1F31E,
    'moon': 0x1F31B,
    'birthday': 0x1F382,
    'gear': 0x2699,
    'speech': 0x1F4AC,
    'thought': 0x1F4AD,
    'yell': 0x1F5EF,
    'coffin': 0x26B0,
    'skull': 0x1F480,
    'crossbones': 0x2620,
    'drumstick': 0x1F357,
    'meat': 0x1F969,
    'cow': 0x1F404,
    'pig': 0x1F416,
    'sheep': 0x1F411,
    'horse': 0x1F40E,
    'horse-head': 0x1F434,
    'beating-heart': 0x1F493,
};
export type EmojiKey = keyof typeof emojis;
export const emojiVariants = {
    'default': 0xFE0F,
    'light': 0x1F3FB,
    'med-light': 0x1F3FC,
    'med': 0x1F3FD,
    'med-dark': 0x1F3FE,
    'dark': 0x1F3FF,
};
export type EmojiVariant = keyof typeof emojiVariants;

const defaultVariant = (emoji: EmojiKey) => {
    if (['offense', 'defense', 'war', 'gear', 'yell', 'coffin', 'crossbones'].some(i => i === emoji)) { return 'default'; }
    return undefined;
};

export const htmlEmoji = (emoji: EmojiKey, variant?: EmojiVariant) => {
    let doVariant = variant || defaultVariant(emoji);
    return doVariant
        ? String.fromCodePoint(emojis[emoji], emojiVariants[doVariant])
        : String.fromCodePoint(emojis[emoji]);
};
