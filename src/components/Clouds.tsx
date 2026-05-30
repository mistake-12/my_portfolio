"use client";

import { forwardRef, useState, useEffect } from "react";
import { works } from "@/data/works";

interface CloudsProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

const widthMap: Record<string, number> = {
  "w-[40vw]": 40,
  "w-[45vw]": 45,
  "w-[55vw]": 55,
  "w-[60vw]": 60,
  "w-[70vw]": 70,
  "w-[75vw]": 75,
  "w-[80vw]": 80,
  "w-[85vw]": 85,
  "w-[160vw]": 160,
};

interface CloudDef {
  id: string;
  leftVw: number;
  topPercent: number;
  scale: number;
  opacity: number;
  duration: number;
  delay: number;
  driftX: number;
}

// 每个作品区域生成 2-3 朵云，分布在轨道线的上方和下方
// 将 cardGap 字符串转为 px 近似值（只处理 vw 单位）
function parseGapToVw(gap?: string): number {
  if (!gap) return 0;
  const match = gap.match(/^(\d+(?:\.\d+)?)vw$/);
  return match ? parseFloat(match[1]) : 0;
}

function generateClouds(): CloudDef[] {
  const clouds: CloudDef[] = [];
  let cumulativeVw = 100; // 工业设计 CategoryIntro 占 100vw

  let prevCategory = works[0]?.categoryId;

  works.forEach((work, i) => {
    // 自动检测分类变化：插入 100vw CategoryIntro（第一个分类前已在初始化时设 100）
    if (i > 0 && work.categoryId !== prevCategory) {
      cumulativeVw += 100;
      prevCategory = work.categoryId;
    }
    const w = widthMap[work.width] || 55;
    const gapVw = parseGapToVw(work.cardGap);
    cumulativeVw += gapVw;
    const areaStart = cumulativeVw;
    cumulativeVw += w;

    const count = 3;
    for (let j = 0; j < count; j++) {
      const aboveTrack = j < Math.ceil(count / 2);
      const topPercent = aboveTrack
        ? 15 + Math.random() * 35
        : 65 + Math.random() * 20;

      clouds.push({
        id: `cloud-${i}-${j}`,
        leftVw: areaStart + Math.random() * w,
        topPercent,
        scale: 0.4 + Math.random() * 1.0,
        opacity: 0.06 + Math.random() * 0.1,
        duration: 25 + Math.random() * 35,
        delay: -(Math.random() * 30),
        driftX: 10 + Math.random() * 25,
      });
    }
  });

  return clouds;
}

const Clouds = forwardRef<HTMLDivElement, CloudsProps>(
  ({ id, className = "", style }, ref) => {
    const [clouds, setClouds] = useState<CloudDef[]>([]);

    useEffect(() => {
      setClouds(generateClouds());
    }, []);

    return (
      <div
        ref={ref}
        id={id}
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{ visibility: "hidden" as React.CSSProperties["visibility"], ...style }}
      >
        {/* SVG 形状定义 */}
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <symbol id="cloud-shape" viewBox="0 0 150 90">
              <rect x="0" y="40" width="150" height="50" rx="25" ry="25" fill="#FFFFFF" />
              <circle cx="60" cy="35" r="35" fill="#FFFFFF" />
              <circle cx="102" cy="42" r="27" fill="#FFFFFF" />
            </symbol>
          </defs>
        </svg>

        {/* 云朵实例：外层 wrapper 负责惯性偏移，内层 SVG 负责漂移动画 */}
        {clouds.map((cloud) => (
          <div
            key={cloud.id}
            data-cloud
            data-weight={cloud.scale}
            className="absolute"
            style={{
              left: `${cloud.leftVw}vw`,
              top: `calc(${cloud.topPercent}% - 200px)`,
              width: 150 * cloud.scale,
              height: 90 * cloud.scale,
              transition: `transform ${0.6 + cloud.scale * 0.6}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
              willChange: "transform",
            }}
          >
            <svg
              viewBox="0 0 150 90"
              className="absolute inset-0"
              style={{
                filter: "drop-shadow(0 8px 8px rgba(0,0,0,0.2))",
                animation: `cloud-drift ${cloud.duration}s linear infinite`,
                animationDelay: `${cloud.delay}s`,
                "--drift-x": `${cloud.driftX}px`,
              } as React.CSSProperties}
            >
              <use href="#cloud-shape" />
            </svg>
          </div>
        ))}

        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes cloud-drift {
            0%   { transform: translateX(0); }
            25%  { transform: translateX(var(--drift-x)); }
            75%  { transform: translateX(calc(var(--drift-x) * -1)); }
            100% { transform: translateX(0); }
          }
        `,
          }}
        />
      </div>
    );
  },
);

Clouds.displayName = "Clouds";

export default Clouds;
