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

// 将 width 字段映射为内部内容的最大宽度
const widthMap: Record<string, string> = {
  "w-[40vw]": "max-w-lg",
  "w-[45vw]": "max-w-xl",
  "w-[55vw]": "max-w-3xl",
  "w-[60vw]": "max-w-3xl",
  "w-[70vw]": "max-w-5xl",
  "w-[75vw]": "max-w-5xl",
  "w-[80vw]": "max-w-6xl",
  "w-[85vw]": "max-w-6xl",
  "w-[160vw]": "max-w-6xl",
};

export default function WorkCanvas({ work, index, className = "" }: WorkCanvasProps) {
  const alignItems = alignYMap[work.alignY];
  const isStacked = work.layout === "stacked";
  const useIsolatedImage = !isStacked && work.imageConfig && work.image;

  // 隔离模式：文字放在图片的对面；普通模式：保持原逻辑
  const justifyContent = useIsolatedImage
    ? work.layout === "img-right" ? "justify-start" : "justify-end"
    : justifyMap[work.layout];
  const maxWidth = widthMap[work.width] || "max-w-5xl";

  // 图片绝对定位样式（从 imageConfig 生成，offsetX 仅影响文字不影响图片）
  const imageAbsoluteStyle: React.CSSProperties = useIsolatedImage
    ? {
        position: "absolute" as const,
        width: work.imageConfig!.width,
        height: work.imageConfig!.height,
        top: work.imageConfig!.top,
        right: work.imageConfig!.right,
        left: work.imageConfig!.left,
      }
    : {};

  return (
    <div
      id={`work-${work.id}`}
      className={`relative z-[3] flex h-full flex-shrink-0 ${useIsolatedImage ? "" : "overflow-hidden"} ${className}`}
      style={{ height: "100vh", ...(work.cardGap ? { marginLeft: work.cardGap } : {}) }}
    >
      {/* 图片隔离层：absolute 脱离 grid，独立定位 */}
      {useIsolatedImage && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* 主图 */}
          <div style={imageAbsoluteStyle} className="pointer-events-auto">
            <WorkMedia work={work} index={index} />
          </div>
          {work.imageConfig?.caption && (
            <div
              className="absolute pointer-events-none"
              style={{
                width: work.imageConfig!.width,
                top: `calc(${work.imageConfig!.top} + ${work.imageConfig!.height} + 8px)`,
                left: work.imageConfig!.left,
                right: work.imageConfig!.right,
              }}
            >
              <p className="text-center text-sm leading-relaxed text-zinc-500 font-sans">{work.imageConfig.caption}</p>
            </div>
          )}
          {/* 额外图片（独立定位，叠加在主图附近） */}
          {work.extraImages?.map((img, idx) => (
              <div
                key={`extra-${idx}`}
                className="pointer-events-auto"
                style={{
                  position: "absolute",
                  width: img.width,
                  top: img.top,
                  right: img.right,
                  left: img.left,
                }}
              >
                <div className="relative w-full overflow-hidden rounded-[15px] pointer-events-auto" style={{ height: img.height }}>
                  {img.video ? (
                    <video
                      src={img.url}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={img.url}
                      alt={`${work.title} - ${idx + 2}`}
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  )}
                </div>
                {img.caption && (
                  <p className="mt-1.5 text-center text-sm leading-relaxed text-zinc-500 font-sans">{img.caption}</p>
                )}
              </div>
            ))}
          {/* 装饰云朵：固定在图片下方 */}
          {work.decorClouds?.map((dc, idx) => (
            <div
              key={`decor-cloud-${idx}`}
              className="absolute pointer-events-none"
              style={{
                left: dc.left,
                top: dc.top,
                width: 150 * (dc.scale || 0.6),
                height: 90 * (dc.scale || 0.6),
                filter: "drop-shadow(0 8px 8px rgba(0,0,0,0.2))",
              }}
            >
              <svg
                viewBox="0 0 150 90"
                className="w-full h-full"
                style={{
                  animation: `cloud-drift ${28 + idx * 5}s linear infinite`,
                  animationDelay: `-${idx * 3}s`,
                  "--drift-x": `${12 + idx * 6}px`,
                } as React.CSSProperties}
              >
                <use href="#cloud-shape" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* 内容安全区：pointer-events-none 让鼠标穿透到图片，内层 pointer-events-auto 保留文字交互 */}
      <div
        className={`relative z-10 flex h-full w-full pointer-events-none ${alignItems} ${justifyContent} px-8 md:px-24 lg:px-32 py-24`}
        style={{
          ...(work.offsetX ? { paddingLeft: work.offsetX } : {}),
          ...(work.offsetY ? { marginTop: work.offsetY } : {}),
        }}
      >
        {/* 隔离模式：单列只放文字；普通模式：双列图文 */}
        <div
          className={`w-full pointer-events-auto ${maxWidth} ${
            useIsolatedImage
              ? "max-w-[608px]"
              : isStacked
                ? "grid grid-cols-1 gap-8"
                : "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
          }`}
        >
          {useIsolatedImage ? (
            // 隔离模式：只渲染文字
            <WorkMeta work={work} index={index} />
          ) : work.layout === "img-left" || work.layout === "stacked" ? (
            <>
              <div>
                <WorkMedia work={work} index={index} />
              </div>
              <div>
                <WorkMeta work={work} index={index} />
              </div>
            </>
          ) : (
            <>
              <div>
                <WorkMeta work={work} index={index} />
              </div>
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
