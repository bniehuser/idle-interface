import { isArray, mergeWith, union } from 'lodash';

export const randArrayItem = (a: readonly any[] | any[]) => a[Math.floor(Math.random() * a.length)];

type StringObject = {[k: string]: any};

export const objectReplace = (a: StringObject, b: StringObject): void => {
  Object.keys(b).forEach(k => { if (a[k] !== undefined) a[k] = b[k]; });
};

export const mergeDeep = <T>(target: T, ...sources: Partial<T>[]): T => {
  return mergeWith(target, ...sources, (objValue: any, srcValue: any) => {
    if (isArray(objValue)) {
      return union(objValue, srcValue);
    }
    return undefined;
  });
};
