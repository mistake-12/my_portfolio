"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import Lenis from "lenis";

interface ScrollContextValue {
  scrollProgress: number;
  currentStage: number;
  scrollY: number;
  lenis: Lenis | null;
}

const ScrollContext = createContext<ScrollContextValue>({
  scrollProgress: 0,
  currentStage: 1,
  scrollY: 0,
  lenis: null,
});

export function useScrollContext() {
  return useContext(ScrollContext);
}

export function useLenis() {
  return useContext(ScrollContext).lenis;
}

function getStage(progress: number): number {
  if (progress < 0.25) return 1;
  if (progress < 0.42) return 2;
  if (progress < 0.65) return 3;
  return 4;
}

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const updateScroll = useCallback((y: number) => {
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? y / docHeight : 0;

    setScrollY(y);
    setScrollProgress(Math.min(progress, 1));
    setCurrentStage(getStage(progress));
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    lenis.on("scroll", ({ scroll }: { scroll: number }) => {
      updateScroll(scroll);
    });

    function raf(time: number) {
      lenis.raf(time);
      rafIdRef.current = requestAnimationFrame(raf);
    }

    rafIdRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [updateScroll]);

  return (
    <ScrollContext.Provider
      value={{
        scrollProgress,
        currentStage,
        scrollY,
        lenis: lenisRef.current,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}
