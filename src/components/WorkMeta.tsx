"use client";

import React from "react";
import { Work } from "@/data/works";
import { ArrowUpRight } from "lucide-react";
import { showMascotMessage } from "@/lib/mascot-events";

interface WorkMetaProps {
  work: Work;
  index: number;
}

export default function WorkMeta({ work, index }: WorkMetaProps) {
  const serial = `US_0${index + 1}_24`;

  return (
    <div className="flex flex-col gap-8">
      {/* 序号 + 分类标签 */}
      <div
        className="flex items-center justify-between reveal-item"
        style={{ transitionDelay: "100ms" }}
      >
        <span className="inline-block border border-zinc-200 text-zinc-400 rounded-full px-3 py-1 text-xs font-mono tracking-widest">
          {serial}
        </span>
        {work.tags && work.tags.length > 0 && (
          <div className="flex gap-2">
            {work.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono tracking-wider text-zinc-400 uppercase"
              >
                [{tag.toLowerCase()}]
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 作品标题 */}
      <h2
        className="font-black text-4xl md:text-5xl lg:text-6xl text-[#FF4D00] leading-[1.05] tracking-tight reveal-item reveal-title"
        style={{ transitionDelay: "180ms" }}
      >
        {work.title}
      </h2>

      {/* 描述 */}
      {work.description && (
        <p
          className="w-full text-base leading-relaxed text-zinc-500 font-sans reveal-item"
          style={{ textAlign: "justify", transitionDelay: "260ms" }}
        >
          {work.description}
        </p>
      )}

      {/* 底部元信息 + 按钮 */}
      <div
        className="mt-4 flex items-center gap-12 reveal-item"
        style={{ transitionDelay: "340ms" }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-black/10" />
            <span className="text-xs font-mono tracking-widest text-zinc-600 uppercase">
              {work.category}
            </span>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {work.year}
          </span>
        </div>

        {/* View Project + GitHub 按钮 */}
        <div className="flex items-baseline gap-4">
          <a
            href={`#work-${work.id}`}
            className="view-link group inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase"
            style={{ color: "#FF4D00" }}
            onClick={(e) => { e.preventDefault(); showMascotMessage("不好意思二级界面现在还没做捏，如果想了解的话可以右键小鸟进行问答"); }}
          >
            <span className="leading-none group-hover:translate-x-[-2px] transition-transform duration-300">
              项目详情
            </span>
            <ArrowUpRight
              size={16}
              className="inline-flex group-hover:translate-x-[2px] group-hover:translate-y-[-1px] transition-transform duration-300"
            />
          </a>
          {work.github && (
            <a
              href={work.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`view-link group inline-flex items-center gap-1.5 font-mono tracking-wider uppercase ${work.linkLabel ? "text-xs" : "text-sm"}`}
              style={{ color: "#FF4D00" }}
            >
              <span className="leading-none group-hover:translate-x-[-2px] transition-transform duration-300">
                {work.linkLabel || "GitHub"}
              </span>
              <ArrowUpRight
                size={16}
                className="inline-flex group-hover:translate-x-[2px] group-hover:translate-y-[-1px] transition-transform duration-300"
              />
            </a>
          )}
        </div>
      </div>

      {/* 入场动画样式 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .reveal-item {
            opacity: 0;
            transform: translateY(24px);
            transition: opacity 1.0s cubic-bezier(0.16, 1, 0.3, 1),
                        transform 1.0s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .reveal-item.is-visible {
            opacity: 1;
            transform: translateY(0);
          }

          .reveal-title {
            opacity: 0;
            transform: translateY(32px);
            transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1),
                        transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .reveal-title.is-visible {
            opacity: 1;
            transform: translateY(0);
          }

          .view-link {
            opacity: 0;
            transform: scale(0);
            transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                        transform 1.0s cubic-bezier(0.25, 1, 0.5, 1);
          }
          .view-link.is-visible {
            opacity: 1;
            transform: scale(1);
          }
        `,
        }}
      />
    </div>
  );
}
