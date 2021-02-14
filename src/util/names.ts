const NAMES = {
  male: [] as string[],
  female: [] as string[],
  surname: [] as string[],
};

const fetchData = async (url: string): Promise<{data: string[]}|undefined> => {
  try {
    console.log('should fetch', url);
    const response = await fetch(url);
    if (!response.ok) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    console.error('Unable to fetch data:', error);
  }
  return;
};

export type NameQualifier = keyof typeof NAMES;

const SERVICE_URL = 'https://www.randomlists.com/data';

const nameUrl = (qualifier: NameQualifier) => {
  return SERVICE_URL + '/names-' + qualifier + '.json';
};

export const getName = async (qualifier: NameQualifier) => {
  if (!NAMES[qualifier].length) {
    NAMES[qualifier] = (await fetchData(nameUrl(qualifier)))?.data || [];
  }
  return NAMES[qualifier][Math.floor(Math.random() * NAMES[qualifier].length)];
};
