"use client";

import React, { useEffect } from "react";
import { useMotionValue } from "framer-motion";

export function useWindowScrollY() {
  const scrollYValue = useMotionValue(0);

  useEffect(() => {
    function onScroll() {
      scrollYValue.set(window.scrollY);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollYValue]);

  return scrollYValue;
}
