"use client";

import React from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function WelcomeContent() {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4">
      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="mb-8 text-xs font-sans font-medium uppercase tracking-ultra-wide text-white/70">
          WELCOME TO MY PORTFOLIO
        </span>

        <h1
          className="mb-6 font-hero font-black tracking-tighter drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
          style={{
            fontSize: "clamp(3rem, 12vw, 9rem)",
            lineHeight: 0.9,
            cursor: "default",
            WebkitTextStroke: "0px",
            WebkitTextFillColor: "#ffffff",
            transformOrigin: "center center",
          }}
        >
          JONY MA.
        </h1>

        <p className="text-lg font-sans font-light tracking-widest text-zinc-400 sm:text-xl">
          Creative Designer
        </p>
      </div>
    </section>
  );
}
