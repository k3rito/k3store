"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import LoadingScreen from "./loading-screen";

const LoadingContext = createContext({
  isLoading: false,
  setIsLoading: (loading: boolean) => {},
});

export const useLoading = () => useContext(LoadingContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
        {children}
      </LoadingContext.Provider>
    );
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
        {isLoading && <LoadingScreen />}
        {children}
      </LoadingContext.Provider>
    </NextThemesProvider>
  );
}
