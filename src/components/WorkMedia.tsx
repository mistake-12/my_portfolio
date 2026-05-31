"use client";

import React from "react";
import { Work } from "@/data/works";

interface WorkMediaProps {
  work: Work;
  index: number;
}

// 为无图片的占位状态生成独特的视觉形态
const SHAPE_CONFIGS = [
  { shape: "circle", color: "from-zinc-100 to-white", rotate: "rotate-12" },
  { shape: "square", color: "from-zinc-100 to-white", rotate: "-rotate-6" },
  { shape: "circle", color: "from-zinc-50 to-white", rotate: "rotate-45" },
  { shape: "square", color: "from-zinc-100 to-white", rotate: "rotate-3" },
];

export default function WorkMedia({ work, index }: WorkMediaProps) {
  const shapeConfig = SHAPE_CONFIGS[index % SHAPE_CONFIGS.length];

  // 隔离模式：父容器已通过 imageConfig 控制尺寸，组件填满父容器
  const isIsolated = !!work.imageConfig && !!work.image;

  // 有图片/视频时渲染
  if (work.image) {
    const isVideo = work.image.endsWith(".mp4");
    return (
      <div
        className={`relative overflow-hidden rounded-[15px] ${
          isIsolated ? "w-full h-full" : "aspect-[4/3]"
        }`}
      >
        {isVideo ? (
          <video
            src={work.image}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={work.image}
            alt={work.title}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        )}
      </div>
    );
  }

  // 无图片时渲染抽象几何占位
  return (
    <div
      className={`relative overflow-hidden rounded-[15px] bg-gradient-to-br ${shapeConfig.color} ${
        isIsolated ? "w-full h-full" : "aspect-[4/3]"
      }`}
    >
      {/* 几何形态占位符 */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${shapeConfig.rotate}`}
      >
        {shapeConfig.shape === "circle" ? (
          <div className="h-48 w-48 rounded-full border border-black/10" />
        ) : (
          <div className="h-40 w-40 rotate-45 border border-black/10" />
        )}
      </div>

      {/* 装饰性光晕 */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-black/5 blur-xl" />
      <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-black/5 blur-xl" />
    </div>
  );
}
