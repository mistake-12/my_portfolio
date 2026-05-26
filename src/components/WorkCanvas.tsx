"use client";

import React from "react";
import { Work } from "@/data/works";
import WorkMedia from "./WorkMedia";
import WorkMeta from "./WorkMeta";

interface WorkCanvasProps {
  work: Work;
  index: number;
  className?: string;
}

// 将 layout 字符串映射为 Tailwind align-items
const alignYMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
} as const;

// 将 layout 字符串映射为 justify-content（图文排列）
const justifyMap = {
  "img-left": "justify-start",
  "img-right": "justify-end",
  stacked: "justify-center",
} as const;

export default function WorkCanvas({ work, index, className = "" }: WorkCanvasProps) {
  const alignItems = alignYMap[work.alignY];
  const justifyContent = justifyMap[work.layout];

  // stacked 模式：垂直单列；其余模式：水平双列
  const isStacked = work.layout === "stacked";

  return (
    <div
      id={`work-${work.id}`}
      className={`relative flex h-full flex-shrink-0 overflow-hidden ${className}`}
      style={{ height: "100vh" }}
    >
      {/* 内容安全区：py-24 防贴边，px-12/32 提供呼吸空间 */}
      <div
        className={`relative z-10 flex h-full w-full ${alignItems} ${justifyContent} px-8 md:px-24 lg:px-32 py-24`}
      >
        {/* 内部布局：stacked 时单列 grid-1，否则双列 grid-2 */}
        <div
          className={`w-full ${isStacked ? "max-w-lg" : "max-w-5xl"} ${
            isStacked
              ? "grid grid-cols-1 gap-8"
              : "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          }`}
        >
          {/* 根据 layout 决定图文顺序 */}
          {work.layout === "img-left" || work.layout === "stacked" ? (
            <>
              {/* 图片在前 */}
              <div>
                <WorkMedia work={work} index={index} />
              </div>
              {/* 文字在后 */}
              <div>
                <WorkMeta work={work} index={index} />
              </div>
            </>
          ) : (
            <>
              {/* 文字在前 */}
              <div>
                <WorkMeta work={work} index={index} />
              </div>
              {/* 图片在后 */}
              <div>
                <WorkMedia work={work} index={index} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
