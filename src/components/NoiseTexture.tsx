"use client";

import { useEffect, useRef } from "react";

export default function NoiseTexture() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const animateNoise = () => {
      const filter = svg.querySelector(
        "feTurbulence"
      ) as SVGFETurbulenceElement | null;
      if (filter) {
        filter.setAttribute("seed", String(Math.random() * 100));
      }
      requestAnimationFrame(animateNoise);
    };

    let running = true;
    const loop = () => {
      if (!running) return;
      const filter = svg.querySelector(
        "feTurbulence"
      ) as SVGFETurbulenceElement | null;
      if (filter) {
        filter.setAttribute("seed", String(Math.floor(Math.random() * 100)));
      }
      setTimeout(() => requestAnimationFrame(loop), 100);
    };

    loop();

    return () => {
      running = false;
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
      width="100%"
      height="100%"
    >
      <filter id="noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.65"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}
