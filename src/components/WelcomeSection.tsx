"use client";

import React, { useState, useEffect } from "react";
import { motion, useTransform, useSpring } from "framer-motion";
import { useWindowScrollY } from "@/hooks/useWindowScrollY";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function WelcomeSection() {
  const scrollY = useWindowScrollY();
  const [winH, setWinH] = useState(900);

  useEffect(() => {
    setWinH(window.innerHeight);
    const handleResize = () => setWinH(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 动画时序：所有效果从 0 开始，到 2.5vh 完成
  // 与 AboutSection 在 2.2vh-2.5vh 交叉过渡
  const endScroll = winH * 2.5;

  // opacity 从 0 开始淡出，2.5vh 完全消失
  const opacity = useTransform(scrollY, [0, endScroll], [1, 0]);

  // scale 从 0 开始放大到 2.5vh
  const scale = useSpring(
    useTransform(scrollY, [0, endScroll], [1, 1.5]),
    { stiffness: 60, damping: 20, mass: 1 }
  );

  // rotateX 从 0 开始倾斜到 2.5vh
  const rotateX = useSpring(
    useTransform(scrollY, [0, endScroll], [0, 60]),
    { stiffness: 80, damping: 20, mass: 1 }
  );

  // blur 从 0 开始模糊到 2.5vh
  const blur = useTransform(scrollY, [0, endScroll], ["blur(0px)", "blur(20px)"]);

  return (
    <section className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-bg px-4">
      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        style={{
          scale,
          rotateX,
          opacity,
          filter: blur,
          transformPerspective: 2000,
          willChange: "transform, opacity, filter",
        }}
      >
        <motion.span
          className="mb-8 text-xs font-sans font-medium uppercase tracking-ultra-wide text-white/70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0, ease: EASE }}
        >
          WELCOME TO MY PORTFOLIO
        </motion.span>

        <motion.h1
          className="mb-6 font-serif text-[clamp(3rem,12vw,9rem)] leading-[0.9] tracking-tight"
          style={{
            cursor: "default",
            WebkitTextStroke: "0.5px rgba(255, 255, 255, 0.2)",
            WebkitTextFillColor: "#ffffff",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          JONY MA.
        </motion.h1>

        <motion.p
          className="text-lg font-sans font-light tracking-widest text-zinc-400 sm:text-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: EASE }}
        >
          Creative Designer
        </motion.p>
      </motion.div>
    </section>
  );
}
