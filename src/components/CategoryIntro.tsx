"use client";

import { useEffect, useRef, useState } from "react";

interface CloudSlot {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  scale: number;
  delay: number;
}

interface CategoryIntroProps {
  id?: string;
  title: string;
  subtitle?: string;
  bgColor?: string;
  accentColor?: string;
  textPosition?: "center" | "top-right";
  hideLine?: boolean;
  cloudSlots?: CloudSlot[];
}

const defaultCloudSlots: CloudSlot[] = [
  { left: "10%", top: "18%", scale: 1.05, delay: 0 },
  { right: "10%", top: "20%", scale: 0.9, delay: 4 },
  { left: "12%", bottom: "22%", scale: 0.98, delay: 3 },
  { right: "12%", bottom: "24%", scale: 1.12, delay: 7 },
];

export default function CategoryIntro({
  id,
  title,
  subtitle,
  bgColor = "#2E2E2E",
  accentColor = "#FF4D00",
  textPosition = "center",
  hideLine = false,
  cloudSlots,
}: CategoryIntroProps) {

  const isTopRight = textPosition === "top-right";
  const clouds = cloudSlots && cloudSlots.length === 4 ? cloudSlots : defaultCloudSlots;
  const [visible, setVisible] = useState(false);
  const elRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visibleRef.current) {
          visibleRef.current = true;
          setTimeout(() => setVisible(true), 200);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id={id}
      ref={elRef}
      className="flex h-full flex-shrink-0 items-center justify-center"
      style={{
        height: "100vh",
        width: "100vw",
        position: "relative",
      }}
    >
      {/* 背景层 */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: bgColor, zIndex: 0 }}
      />

      {/* 云朵：绝对定位，不依赖外部宽度计算 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        {clouds.map((c, i) => (
          <div
            key={`cat-cloud-${i}`}
            className="absolute"
            style={{
              left: c.left, right: c.right,
              top: c.top, bottom: c.bottom,
              width: 150 * c.scale,
              height: 90 * c.scale,
              filter: "drop-shadow(0 8px 8px rgba(0,0,0,0.15))",
            }}
          >
            <svg
              viewBox="0 0 150 90"
              className="w-full h-full"
              style={{
                animation: `cloud-drift ${28 + i * 6}s linear infinite`,
                animationDelay: `-${c.delay}s`,
                "--drift-x": `${14 + i * 8}px`,
              } as React.CSSProperties}
            >
              <use href="#cloud-shape" />
            </svg>
          </div>
        ))}
      </div>

      {/* 装饰几何元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
        <div
          className="absolute rounded-full opacity-[0.04]"
          style={{
            width: "60vw",
            height: "60vw",
            right: "-20vw",
            top: "-20vw",
            border: `2px solid ${accentColor}`,
          }}
        />
        <div
          className="absolute opacity-[0.06]"
          style={{
            left: "10vw",
            bottom: "20vh",
            width: "30vw",
            height: "1px",
            backgroundColor: accentColor,
          }}
        />
        <div
          className="absolute opacity-[0.06]"
          style={{
            left: "10vw",
            bottom: "calc(20vh + 8px)",
            width: "20vw",
            height: "1px",
            backgroundColor: accentColor,
          }}
        />
      </div>

      {/* 文字层：在云朵之上 */}
      <div
        className={`relative ${isTopRight ? "text-left self-start mr-auto ml-12 mt-16" : "text-center"}`}
        style={{ zIndex: 10 }}
      >

        <h1
          className="font-black text-5xl md:text-7xl lg:text-8xl leading-none tracking-tighter"
          style={{
            color: accentColor,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="mt-8 text-sm md:text-base leading-relaxed max-w-[68ch] mx-auto"
            style={{
              color: "rgba(255,255,255,0.45)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 1.0s cubic-bezier(0.16, 1, 0.3, 1) 150ms, transform 1.0s cubic-bezier(0.16, 1, 0.3, 1) 150ms",
            }}
          >
            {subtitle}
          </p>
        )}

        {!hideLine && (
        <div
          className="mt-16 flex justify-center"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 1.0s cubic-bezier(0.16, 1, 0.3, 1) 400ms",
          }}
        >
          <div
            className="h-px"
            style={{
              width: "60px",
              backgroundColor: accentColor,
              opacity: 0.4,
            }}
          />
        </div>
        )}
      </div>
    </div>
  );
}
