"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Beams from "@/components/ui/Beams";
import WelcomeContent from "@/components/WelcomeContent";
import AboutContent from "@/components/AboutContent";
import DisciplineContent from "@/components/DisciplineContent";
import ScrollIndicator from "@/components/ui/ScrollIndicator";
import WorkCanvas from "@/components/WorkCanvas";
import WorksProgress from "@/components/ui/WorksProgress";
import { works } from "@/data/works";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Home() {
  const masterRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const masterTrack = document.querySelector("#master-track") as HTMLElement;
      const scrollIndicator = document.querySelector(
        "#scroll-indicator"
      ) as HTMLElement;
      const stage3 = document.querySelector("#stage3") as HTMLElement;
      const masterContainer = document.querySelector(
        "#master-pin-container"
      ) as HTMLElement;

      if (!masterTrack || !scrollIndicator || !stage3 || !masterContainer)
        return;

      // 计算横向总距离（主轨道总宽 - 1个屏幕宽）
      const horizontalDistance = masterTrack.scrollWidth - window.innerWidth;

      // 3D 翻转 + 横向平移全部合并为唯一 Timeline
      // 总滚动空间 = 400vh(3D剧场) + horizontalDistance(横向轨道)
      const totalScrollDistance = 400 + horizontalDistance / window.innerWidth * 100;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: masterContainer,
          start: "top top",
          end: () => `+=${totalScrollDistance}%`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // ─────────────────────────────────────────────────────────────
      // 第一部分：3D 剧场（Stage 1 → Stage 2 → Stage 3）
      // ─────────────────────────────────────────────────────────────

      // Stage 1: 初始可见 → Z轴放大 + 模糊淡出
      tl.to("#stage1", {
        scale: 1.5,
        rotateX: 60,
        opacity: 0,
        filter: "blur(20px)",
        pointerEvents: "none",
        duration: 1,
        ease: "power2.inOut",
      });

      // Stage 2: 交叉淡入（Stage 1 消失后半段提前进入）
      tl.fromTo(
        "#stage2",
        { y: 100, opacity: 0, pointerEvents: "none" },
        {
          y: 0,
          opacity: 1,
          pointerEvents: "auto",
          duration: 1,
          ease: "power2.out",
        },
        "-=0.5"
      );

      // 初始化 Stage 3：由 GSAP 接管，确保双向联动
      tl.call(() => {
        gsap.set("#stage3", { rotateX: 90, opacity: 0 });
      });

      // Stage 2 → Stage 3：3D 翻转
      // 翻转前半段：Stage 2 翻转到 -90deg 消失
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

      // 翻转后半段：Stage 3 从 90deg 翻转到 0deg 显现
      tl.fromTo(
        "#stage3",
        { rotateX: 90, opacity: 0 },
        {
          rotateX: 0,
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.6,
          ease: "power2.out",
        }
      );

      // 停留阅读 Stage 3
      tl.to({}, { duration: 2 });

      // ─────────────────────────────────────────────────────────────
      // 第二部分：镜头向右平移（Stage 3 → Stage 4 作品集）
      // master-track 向左推动，Stage 4 从屏幕右侧滑入
      // ─────────────────────────────────────────────────────────────

      tl.to(
        "#master-track",
        {
          x: -horizontalDistance,
          ease: "none",
          duration: horizontalDistance / window.innerWidth,
        }
      );
    },
    { scope: masterRef }
  );

  return (
    <main
      id="master-pin-container"
      ref={masterRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* 全局 Three.js 光束背景：底层 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 左侧光束：倾斜朝右 */}
        <div className="absolute inset-0 opacity-15">
          <Beams rotation={-20} beamNumber={5} lightColor="#e0eeff" speed={1.2} />
        </div>
        {/* 右侧光束：倾斜朝左 */}
        <div className="absolute inset-0 opacity-15">
          <Beams rotation={20} beamNumber={5} lightColor="#ffe8d0" speed={1.0} />
        </div>
        {/* 中心光束 */}
        <div className="absolute inset-0 opacity-30">
          <Beams rotation={30} beamNumber={6} lightColor="#ffffff" speed={1.5} />
        </div>
        {/* 多点渐隐遮罩 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 45% 55% at 50% 50%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" +
              ", radial-gradient(ellipse 40% 60% at 12% 50%, rgba(0,0,0,0.05) 0%, transparent 100%)" +
              ", radial-gradient(ellipse 40% 60% at 88% 50%, rgba(0,0,0,0.05) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* 全局移动的主轨道：横向 Flex 容器 */}
      <div
        id="master-track"
        className="flex h-screen w-max"
        style={{ willChange: "transform" }}
      >
        {/* ── 胶片第一格：3D 剧场（Stage 1, 2, 3）── */}
        <div
          className="relative w-screen h-screen flex-shrink-0"
          style={{ perspective: "2000px" }}
        >
          {/* Stage 1: 初始可见（z-30 最前） */}
          <div
            id="stage1"
            className="absolute inset-0 z-30 flex h-full w-full items-center justify-center"
            style={{ transformStyle: "preserve-3d", pointerEvents: "auto" }}
          >
            <WelcomeContent />
          </div>

          {/* Stage 2: 初始 opacity-0（z-20） */}
          <div
            id="stage2"
            className="absolute inset-0 z-20 flex h-full w-full items-center justify-center opacity-0"
            style={{ transformStyle: "preserve-3d", pointerEvents: "none" }}
          >
            <AboutContent />
          </div>

          {/* Stage 3: 初始 opacity-0 + rotateX(90deg)（z-10） */}
          <div
            id="stage3"
            className="absolute inset-0 z-10 flex h-full w-full items-center justify-center opacity-0"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(90deg)",
              pointerEvents: "none",
            }}
          >
            <DisciplineContent />
          </div>

          {/* 滚动指示器：固定在视口底部正中央 */}
          <ScrollIndicator />
        </div>

        {/* ── 胶片后续格子：Stage 4 作品集 ── */}
        {works.map((work, index) => (
          <WorkCanvas
            key={work.id}
            work={work}
            index={index}
          />
        ))}
      </div>

      {/* 右下角进度指示器（仅在 Works 区域可见） */}
      <WorksProgress worksLength={works.length} />
    </main>
  );
}
