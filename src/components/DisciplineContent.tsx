"use client";

import React from "react";

const disciplines = [
  { number: "01", title: "产品设计", label: "Product Design" },
  { number: "02", title: "软件设计", label: "Software Design" },
  { number: "03", title: "实习经历", label: "Internship Experience" },
  { number: "04", title: "其他项目", label: "Other Projects" },
];

export default function DisciplineContent() {
  return (
    <section className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-4">
      {/* 无形宽幅骨架：透明无边距，拉开至全宽 */}
      <div className="flex w-[90vw] max-w-7xl flex-col mx-auto">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <span className="drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] text-[11px] uppercase tracking-widest text-white/70">
            Select Discipline
          </span>
        </div>

        {/* List */}
        <ul className="group">
          {disciplines.map((item, index) => (
            <li
              key={item.number}
              className="group/item relative cursor-pointer border-t border-white/[0.03] py-10 md:py-14 first:border-t-0"
            >
              {/* 高亮底线（hover 从左到右划过） */}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white origin-left scale-x-0 transition-transform duration-700 ease-out group-hover/item:scale-x-100" />

              <div className="flex items-baseline justify-between">
                {/* 文字内容：hover 主标题右滑 translate-x-6 */}
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
