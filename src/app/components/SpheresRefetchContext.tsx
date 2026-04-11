'use client';
import { createContext, useContext, useState, useCallback } from 'react';

interface SpheresRefetchContextValue {
  version: number;
  triggerRefetch: () => void;
}

const SpheresRefetchContext = createContext<SpheresRefetchContextValue>({
  version: 0,
  triggerRefetch: () => {},
});

export function SpheresRefetchProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);
  const triggerRefetch = useCallback(() => setVersion((v) => v + 1), []);
  return (
    <SpheresRefetchContext.Provider value={{ version, triggerRefetch }}>
      {children}
    </SpheresRefetchContext.Provider>
  );
}

export function useSpheresRefetch() {
  return useContext(SpheresRefetchContext);
}

