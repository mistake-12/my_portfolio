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
function generateClouds(): CloudDef[] {
  const clouds: CloudDef[] = [];
  let cumulativeVw = 0;

  works.forEach((work, i) => {
    const w = widthMap[work.width] || 55;
    const areaStart = cumulativeVw;
    cumulativeVw += w;

    // 每区域 2-3 朵云
    const count = i % 3 === 0 ? 2 : 1;

    for (let j = 0; j < count; j++) {
      // 上方云：top 在 10%-55%，下方云：85%-95%（轨道线在 75%）
      const aboveTrack = j < Math.ceil(count / 2);
      const topPercent = aboveTrack
        ? 10 + Math.random() * 45
        : 85 + Math.random() * 10;

      clouds.push({
        id: `cloud-${i}-${j}`,
        leftVw: areaStart + Math.random() * w,
        topPercent,
        scale: 0.5 + Math.random() * 1.2,
        opacity: 0.08 + Math.random() * 0.12,
        duration: 25 + Math.random() * 35,
        delay: -(Math.random() * 30),
        driftX: 15 + Math.random() * 40,
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
        className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
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
