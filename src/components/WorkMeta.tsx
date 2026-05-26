"use client";

import React from "react";
import { Work } from "@/data/works";

interface WorkMetaProps {
  work: Work;
  index: number;
}

export default function WorkMeta({ work, index }: WorkMetaProps) {
  const serial = `US_0${index + 1}_24`;

  return (
    <div className="flex flex-col gap-8">
      {/* 序号 + 分类标签 */}
      <div className="flex items-center justify-between">
        <span className="inline-block border border-zinc-200 text-zinc-500 rounded-full px-3 py-1 text-xs font-mono tracking-widest">
          {serial}
        </span>
        {work.tags && work.tags.length > 0 && (
          <div className="flex gap-2">
            {work.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono tracking-wider text-zinc-500 uppercase"
              >
                [{tag.toLowerCase()}]
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 作品标题 */}
      <h2 className="font-black text-4xl md:text-5xl lg:text-6xl text-zinc-900 leading-[1.05] tracking-tight">
        {work.title}
      </h2>

      {/* 描述 */}
      {work.description && (
        <p className="max-w-md text-sm leading-relaxed text-zinc-500 font-sans">
          {work.description}
        </p>
      )}

      {/* 底部元信息 */}
      <div className="mt-4 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-black/10" />
          <span className="text-xs font-mono tracking-widest text-zinc-600 uppercase">
            {work.category}
          </span>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          {work.year}
        </span>
      </div>
    </div>
  );
}
