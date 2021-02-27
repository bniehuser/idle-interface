export const ALWAYS = 0;
export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const WEEK = DAY * 7;
export const MONTH = DAY * 30; // don't use this
export const YEAR = Math.floor(DAY * 365.25); // also a bad approximation
export const DECADE = YEAR * 10;
export const CENTURY = YEAR * 100;

export const timeNames = ({
  [SECOND]: 'second',
  [MINUTE]: 'minute',
  [HOUR]: 'hour',
  [DAY]: 'day',
  [WEEK]: 'week',
  [MONTH]: 'month',
  [YEAR]: 'year',
  [DECADE]: 'decade',
  [CENTURY]: 'century',
});

export const legibleTimeDiff = (diff: number) => {
  const keys = Object.keys(timeNames).map(k => parseInt(k, 10));
  let result: string = '';
  keys.some((t, i) => {
    if (i > 0 && diff < t) {
      result = (diff / keys[i - 1]).toFixed(2) + ' ' + timeNames[keys[i - 1]];
      return true;
    }
    return false;
  });
  if (!result) {
    result = (diff / CENTURY).toFixed(2) + ' centuries';
  }
  return result;
};

export const fastForwardFrequency = (diff: number) => {
  const keys = Object.keys(timeNames).map(k => parseInt(k, 10));
  let result = CENTURY;
  keys.some((t, i) => {
    if (i > 0 && diff < t) {
      result = keys[i - 1];
      return true;
    }
    return false;
  });
  return result;
};
