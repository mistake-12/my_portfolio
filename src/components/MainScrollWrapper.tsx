"use client";

import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WelcomeContent from "./WelcomeContent";
import AboutContent from "./AboutContent";
import DisciplineContent from "./DisciplineContent";
import ScrollIndicator from "./ui/ScrollIndicator";

gsap.registerPlugin(ScrollTrigger);

export default function MainScrollWrapper() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=400%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // Stage 1: 初始可见，Z轴放大+倾斜穿越消失
      tl.to("#stage1", {
        scale: 1.5,
        rotateX: 60,
        opacity: 0,
        filter: "blur(20px)",
        pointerEvents: "none",
        duration: 1,
        ease: "power2.inOut",
      });

      // Stage 2: 交叉淡入，重塑连贯性
      // 在 Stage 1 消失的后半段 (-=0.5) 提前进入
      tl.fromTo(
        "#stage2",
        { y: 100, opacity: 0, pointerEvents: "none" },
        { y: 0, opacity: 1, pointerEvents: "auto", duration: 1, ease: "power2.out" },
        "-=0.5"
      );

      // 初始化 Stage 3：初始 CSS 状态设为 opacity-0 且 rotateX 为 90deg
      // 由 GSAP timeline 接管，确保正反双向联动
      tl.call(() => {
        gsap.set("#stage3", { rotateX: 90, opacity: 0 });
      });

      // 【前半段】：Stage 2 从 0度 翻转到 -90度，同时淡出
      // ScrollIndicator 也同步消散（不嵌套在 Stage 内，用独立 animation 同步）
      tl.to(
        "#stage2, #scroll-indicator",
        {
          rotateX: -90,
          opacity: 0,
          filter: "blur(20px)",
          pointerEvents: "none",
          duration: 0.6,
          ease: "power2.in",
        }
      );

      // 【后半段】：Stage 3 从 90度 翻转回 0度，同时淡入
      tl.fromTo(
        "#stage3",
        {
          rotateX: 90,
          opacity: 0,
        },
        {
          rotateX: 0,
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.6,
          ease: "power2.out",
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
      style={{ perspective: "2000px" }}
    >
      {/* Stage 1: 初始可见，之后淡出 (z-30 最前) */}
      <div
        id="stage1"
        className="absolute inset-0 z-30 flex h-full w-full items-center justify-center"
        style={{ transformStyle: "preserve-3d", pointerEvents: "auto" }}
      >
        <WelcomeContent />
      </div>

      {/* Stage 2: 初始 opacity-0 + pointer-events-none，之后滑入 (z-20) */}
      <div
        id="stage2"
        className="absolute inset-0 z-20 flex h-full w-full items-center justify-center opacity-0"
        style={{ transformStyle: "preserve-3d", pointerEvents: "none" }}
      >
        <AboutContent />
      </div>

      {/* Stage 3: 初始 opacity-0 + pointer-events-none + rotateX(90deg)，由 GSAP timeline 接管 */}
      <div
        id="stage3"
        className="absolute inset-0 z-10 flex h-full w-full items-center justify-center opacity-0"
        style={{ transformStyle: "preserve-3d", transform: "rotateX(90deg)", pointerEvents: "none" }}
      >
        <DisciplineContent />
      </div>

      {/* 滚动指示器：固定在视口底部正中央，Stage 1/2 时始终可见，Stage 2 消失时随其一同消散 */}
      <ScrollIndicator />
    </section>
  );
}
