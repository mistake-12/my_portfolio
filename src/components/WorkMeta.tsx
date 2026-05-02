"use client";

import React from "react";
import { Work } from "@/data/works";

interface WorkMetaProps {
  work: Work;
  index: number;
}

// 序号标签样式
const SERIAL_STYLES = [
  "bg-white/10 text-white/60",
  "bg-white/8 text-white/50",
  "bg-white/6 text-white/40",
  "bg-white/10 text-white/60",
];

export default function WorkMeta({ work, index }: WorkMetaProps) {
  const serialStyle = SERIAL_STYLES[index % SERIAL_STYLES.length];
  const serial = `US_0${index + 1}_24`;

  return (
    <div className="flex flex-col gap-6">
      {/* 序号 + 分类标签 */}
      <div className="flex items-center justify-between">
        <span className={`inline-block px-3 py-1 text-xs font-mono tracking-widest rounded-sm ${serialStyle}`}>
          {serial}
        </span>
        {work.tags && work.tags.length > 0 && (
          <div className="flex gap-2">
            {work.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono tracking-wider text-white/30 uppercase"
              >
                [{tag.toLowerCase()}]
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 作品标题 */}
      <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] tracking-wide">
        {work.title}
      </h2>

      {/* 描述 */}
      {work.description && (
        <p className="max-w-md text-sm leading-relaxed text-white/50 font-sans">
          {work.description}
        </p>
      )}

      {/* 底部元信息 */}
      <div className="mt-4 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-white/20" />
          <span className="text-xs font-mono tracking-widest text-white/40 uppercase">
            {work.category}
          </span>
        </div>
        <span className="text-xs font-mono text-white/30">
          {work.year}
        </span>
      </div>
    </div>
  );
}
