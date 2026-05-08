"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import LoadingScreen from "./loading-screen";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const value = useMemo(() => ({ isLoading, setIsLoading }), [isLoading]);

  if (!mounted) {
    return (
      <LoadingContext.Provider value={value}>
        <div style={{ visibility: "hidden" }}>{children}</div>
      </LoadingContext.Provider>
    );
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <LoadingContext.Provider value={value}>
        {isLoading && <LoadingScreen />}
        {children}
      </LoadingContext.Provider>
    </NextThemesProvider>
  );
}
