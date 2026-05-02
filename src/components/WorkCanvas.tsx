"use client";

import React from "react";
import { Work } from "@/data/works";
import WorkMedia from "./WorkMedia";
import WorkMeta from "./WorkMeta";

interface WorkCanvasProps {
  work: Work;
  index: number;
}

// 渐变背景调色板：为 Phase 1 占位背景提供视觉区分
const CANVAS_GRADIENTS = [
  "from-zinc-900/40 via-zinc-950/60 to-black",
  "from-stone-900/30 via-neutral-950/60 to-black",
  "from-zinc-800/30 via-stone-950/60 to-black",
  "from-neutral-900/40 via-zinc-950/60 to-black",
];

export default function WorkCanvas({ work, index }: WorkCanvasProps) {
  const gradient = CANVAS_GRADIENTS[index % CANVAS_GRADIENTS.length];

  return (
    <div
      className="relative flex h-full w-screen flex-shrink-0 overflow-hidden"
      style={{ height: "100vh", width: "100vw" }}
    >
      {/* 背景渐变层 */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
      />

      {/* 噪点纹理叠加 */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: 0.04,
          }}
        />
      </div>

      {/* 内容安全区：max-w-7xl 防止超宽屏排版失控 */}
      <div className="relative z-10 flex h-full w-full max-w-7xl mx-auto px-8 md:px-16 items-center">
        <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* 左侧：作品主视觉 */}
          <div className="order-2 lg:order-1">
            <WorkMedia work={work} index={index} />
          </div>

          {/* 右侧：作品元信息 */}
          <div className="order-1 lg:order-2">
            <WorkMeta work={work} index={index} />
          </div>

        </div>
      </div>

      {/* 画布边界微妙的暗角 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.3) 100%)",
        }}
      />
    </div>
  );
}
