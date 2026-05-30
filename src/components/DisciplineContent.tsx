"use client";

import React from "react";
import { works } from "@/data/works";

const disciplines = [
  { number: "01", title: "工业设计", label: "Industrial Design", target: "industrial" },
  { number: "02", title: "软件开发", label: "Software Development", target: "software" },
  { number: "03", title: "实习经历", label: "Internship Experience", target: "internship" },
  { number: "04", title: "其他项目", label: "Other Projects", target: "other" },
];

const widthMap: Record<string, number> = {
  "w-[40vw]": 40, "w-[45vw]": 45, "w-[55vw]": 55,
  "w-[60vw]": 60, "w-[70vw]": 70, "w-[75vw]": 75,
  "w-[80vw]": 80, "w-[85vw]": 85, "w-[160vw]": 160,
};

function parseGap(gap?: string): number {
  if (!gap) return 0;
  const m = gap.match(/^(\d+(?:\.\d+)?)vw$/);
  return m ? parseFloat(m[1]) : 0;
}

/** 计算每个分类引导页在横轴上的起始 vw 位置 */
function getCategoryStarts(): Record<string, number> {
  const categoryOrder = ["industrial", "software", "internship", "other"];
  const starts: Record<string, number> = {};
  let cum = 100; // 第一个 CategoryIntro 占 100vw

  categoryOrder.forEach((catId) => {
    starts[catId] = cum - 100; // CategoryIntro 起始位置
    const catWorks = works.filter((w) => w.categoryId === catId);
    catWorks.forEach((w) => {
      cum += parseGap(w.cardGap);
      cum += widthMap[w.width] || 55;
    });
    cum += 100; // 下一个 CategoryIntro
  });

  return starts;
}

function scrollToCategory(target: string) {
  const innerW = window.innerWidth;
  const innerH = window.innerHeight;

  // 计算目标分类的横轴起始位置（vw → px）
  const starts = getCategoryStarts();
  const categoryVw = starts[target] ?? 0;
  const categoryPx = (categoryVw / 100) * innerW;

  // 要让 100vw 的 CategoryIntro 填满视口：其左侧需对齐 0
  // categoryPx = 在 stage4-wrapper 中的像素位置
  // stage4-wrapper 从 innerW 处开始（第一个 w-screen 占位）
  // GSAP translateX = 0 时，CategoryIntro 在 innerW + categoryPx 处
  // 需要 translateX = -(innerW + categoryPx)
  const targetTrackX = -(innerW + categoryPx);

  // GSAP 时间线参数
  const wrapper = document.getElementById("stage4-wrapper");
  const stage4Width = wrapper?.scrollWidth || innerW * 5;
  const lockOffset = innerW * 0.1;
  const flyDistancePx = Math.max(1, stage4Width - lockOffset);
  const flyDur = flyDistancePx / innerW;

  const BEFORE_STAGE4_DUR = 2.8;
  const REVEAL_DUR = 1;
  const TOTAL_TIMELINE = BEFORE_STAGE4_DUR + REVEAL_DUR + flyDur;
  const totalScrollPx = (400 + stage4Width / innerW * 100) * (innerH / 100);
  const pxPerUnit = totalScrollPx / TOTAL_TIMELINE;

  // reveal 结束时的 trackX = -lockOffset
  // 还需在 fly 阶段移动: |targetTrackX| - lockOffset
  const needFly = Math.max(0, Math.abs(targetTrackX) - lockOffset);
  const flyProgress = Math.min(1, needFly / flyDistancePx);
  const targetTimeline = BEFORE_STAGE4_DUR + REVEAL_DUR + flyProgress * flyDur;
  const targetY = Math.round(targetTimeline * pxPerUnit);

  // 淡入遮罩
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:9999;background:#000;opacity:0;transition:opacity 0.25s;pointer-events:none";
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.style.opacity = "1"; });

  // Lenis 平滑滚动
  // @ts-ignore
  const lenis = window.lenis;
  if (lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(targetY, { duration: 0.5, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
  } else {
    document.scrollingElement?.scrollTo({ top: targetY, behavior: "smooth" });
  }

  // 滚动到位后淡出遮罩
  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 300);
  }, 700);
}

export default function DisciplineContent() {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4">
      <div className="flex w-[90vw] max-w-7xl flex-col mx-auto -translate-y-8 md:-translate-y-12">
        <div className="mb-16 md:mb-24">
          <span className="drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] text-[11px] uppercase tracking-widest text-white/70">
            Select Discipline
          </span>
        </div>

        <ul className="group">
          {disciplines.map((item, index) => (
            <li
              key={item.number}
              className="group/item relative cursor-pointer border-t border-white/[0.03] py-10 md:py-14 first:border-t-0"
              onClick={() => scrollToCategory(item.target)}
            >
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white origin-left scale-x-0 transition-transform duration-700 ease-out group-hover/item:scale-x-100" />

              <div className="flex items-baseline justify-between">
                <div className="group/inner flex items-baseline">
                  <span className="mr-8 font-mono text-sm text-white/50 transition-transform duration-500 ease-out group-hover/inner:translate-x-2">
                    {item.number}
                  </span>
                  <span className="font-hero font-black text-white tracking-tight text-5xl transition-transform duration-500 ease-out group-hover/inner:translate-x-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] md:text-6xl lg:text-7xl">
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="hidden font-sans text-xs text-white/50 uppercase tracking-[0.2em] md:block">
                    {item.label}
                  </span>
                  <svg
                    className="h-5 w-5 text-white/50 transition-transform duration-300 group-hover/item:translate-x-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
