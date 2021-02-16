export const addNth = (num: number) => {
  switch (num % 10) {
    case 1: return num + 'st';
    case 2: return num + 'nd';
    case 3: return num + 'rd';
    default: return num + 'th';
  }
};

const byteSizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

export const bytesToSize = (bytes: number) => {
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (Math.round((bytes / Math.pow(1024, i)) * 100) / 100) + byteSizes[i];
};
