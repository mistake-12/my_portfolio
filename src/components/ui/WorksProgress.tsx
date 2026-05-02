"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface WorksProgressProps {
  worksLength: number;
}

export default function WorksProgress({ worksLength }: WorksProgressProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const masterTrack = document.querySelector("#master-track") as HTMLElement;
    const masterContainer = document.querySelector(
      "#master-pin-container"
    ) as HTMLElement;

    if (!masterTrack || !masterContainer) return;

    const horizontalDistance = masterTrack.scrollWidth - window.innerWidth;

    // master-track 的 x 范围：0 → -horizontalDistance
    // Works 进度范围：0% → 100%
    const worksStartProgress = 400 / (400 + horizontalDistance / window.innerWidth * 100);

    // 监听 master-track 的 x 位置变化，映射为 works 进度
    const st = ScrollTrigger.create({
      trigger: masterContainer,
      start: "top top",
      end: () => `+=${400 + horizontalDistance / window.innerWidth * 100}%`,
      onUpdate: (self) => {
        const masterProgress = self.progress;

        // 仅在进入 Works 区域后显示进度器
        if (masterProgress > worksStartProgress) {
          setVisible(true);
          // 将 master timeline 进度映射到 Works 段进度（0 → 1）
          const worksRawProgress =
            (masterProgress - worksStartProgress) / (1 - worksStartProgress);
          const worksPercent = Math.round(worksRawProgress * 100);
          setProgress(Math.min(100, worksPercent));

          if (counterRef.current) {
            gsap.to(counterRef.current, {
              innerText: worksPercent,
              snap: { innerText: 1 },
              duration: 0.15,
            });
          }
        } else {
          setVisible(false);
        }
      },
    });

    // 进场动画：opacity 从 0 → 1
    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5 }
    );

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 right-8 z-50 pointer-events-none opacity-0"
    >
      <div className="flex flex-col items-end gap-1">
        {/* 进度数字 */}
        <span
          ref={counterRef}
          className="font-mono text-xs tracking-widest text-white/40 tabular-nums"
        >
          {String(progress).padStart(2, "0")}%
        </span>
        {/* 进度条 */}
        <div className="h-px w-16 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white/40 transition-transform duration-100"
            style={{
              width: `${progress}%`,
              transform: "scaleX(1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
