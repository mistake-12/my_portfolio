"use client";

import React, { useEffect } from "react";
import { useMotionValue } from "framer-motion";
import { useLenis } from "@/context/ScrollContext";

export function useLenisScroll() {
  const lenis = useLenis();
  const scrollYProgressValue = useMotionValue(0);

  useEffect(() => {
    if (!lenis) return;

    const updateProgress = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? lenis.scroll / docHeight : 0;
      scrollYProgressValue.set(Math.min(progress, 1));
    };

    lenis.on("scroll", updateProgress);
    updateProgress();

    return () => {
      lenis.off("scroll", updateProgress);
    };
  }, [lenis, scrollYProgressValue]);

  return scrollYProgressValue;
}

export function useLenisScrollY() {
  const lenis = useLenis();
  const scrollYValue = useMotionValue(0);

  useEffect(() => {
    if (!lenis) return;

    const handleScroll = ({ scroll }: { scroll: number }) => {
      scrollYValue.set(scroll);
    };

    lenis.on("scroll", handleScroll);
    scrollYValue.set(lenis.scroll);

    return () => {
      lenis.off("scroll", handleScroll);
    };
  }, [lenis, scrollYValue]);

  return scrollYValue;
}
