import { useCallback, useEffect, useState } from 'react';

const useTimedRefresh = (frequency: number) => {
  const [, forceRefresh] = useState(false);
  const [handle, setHandle] = useState<NodeJS.Timeout|undefined>(undefined);
  useEffect(() => {
    start();
    return () => pause();
  }, []);
  const pause = useCallback(() => {
    if (handle) {
      clearInterval(handle);
      setHandle(undefined);
    }
  }, [handle]);
  const start = useCallback(() => {
    setHandle(setInterval(() => forceRefresh((s: boolean) => !s), frequency));
  }, [handle]);
  return { start, pause };
};
export default useTimedRefresh;
