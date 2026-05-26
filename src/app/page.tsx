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
import FlyingMascot from "@/components/FlyingMascot";
import { works } from "@/data/works";
import { extendPath } from "@/lib/extendPath";

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

      const stage4Wrapper = document.querySelector(
        "#stage4-wrapper"
      ) as HTMLElement | null;

      const journeyPath = stage4Wrapper?.querySelector(
        "#journey-path"
      ) as SVGPathElement | null;
      const guideSvg = stage4Wrapper?.querySelector(
        "#guide-line-svg"
      ) as SVGSVGElement | null;

      // 实线：fixed clip 容器 + SVG（HUD 层，不跟随 master-track）
      const solidClip = document.querySelector(
        "#solid-line-clip"
      ) as HTMLElement | null;
      const solidFixedSvg = solidClip?.querySelector(
        "#solid-line-fixed-svg"
      ) as SVGSVGElement | null;
      const solidFixedPath = solidClip?.querySelector(
        "#journey-path-fixed-fill"
      ) as SVGPathElement | null;

      // HUD 层：不随 master-track 平移，用于锁定屏幕坐标
      const mascot = document.querySelector(
        "#flying-mascot"
      ) as HTMLElement | null;

      if (
        !masterTrack ||
        !scrollIndicator ||
        !stage3 ||
        !masterContainer ||
        !stage4Wrapper ||
        !journeyPath ||
        !guideSvg ||
        !solidClip ||
        !solidFixedSvg ||
        !solidFixedPath ||
        !mascot
      )
        return;

      // 计算横向总距离（主轨道总宽 - 1个屏幕宽）
      const horizontalDistance = masterTrack.scrollWidth - window.innerWidth;

      // 生成 Stage 4 的程序化路径：起点严格为 Stage4 左侧 (x=0)
      // 起始高度：随 viewport 动态变化（75% 处）
      const baselineY = window.innerHeight * 0.75;

      // ── 使用 Vector64.svg 的曲线路径作为可复用模板（平铺拼接，不缩放） ──
      // 原始 SVG: width=3840 height=653，起点/终点 y=617.125
      const VECTOR64_WIDTH = 3840;
      const VECTOR64_BASELINE_Y = 617.125;

      const baseD =
        "M0 617.125L177.275 460.241C198.189 441.732 229.108 440.101 251.854 456.307L357.259 531.405C385.529 551.547 424.942 543.569 443.153 514.018L500.973 420.198C515.706 396.291 574.113 414.134 599 401.125C640.518 379.423 654.27 355.94 665.024 328.933C676.677 299.669 708.568 286.453 737.679 298.486L741.145 299.918C772.503 312.88 808.361 297.28 820.256 265.502L901.436 48.6277C917.08 6.83563 971.247 -3.86286 1001.6 28.8435L1042.53 72.9355C1073.21 105.992 1128.03 94.6461 1143.07 52.1254L1147.18 40.4982C1164.33 -7.97377 1230.51 -13.8388 1255.92 30.8628L1370 231.625L1458.54 376.332C1475.49 404.051 1511.44 413.231 1539.61 397.041L1646.83 335.424C1679.57 316.614 1721.33 332.347 1733.52 368.078L1796.69 553.301C1813.81 603.496 1882.86 608.427 1906.94 561.174L1914.92 545.499C1932.39 511.224 1977.14 502.008 2006.73 526.592L2117.08 618.287C2139.56 636.967 2172.24 636.729 2194.44 617.721L2323.5 507.255C2329.77 501.892 2334.86 495.296 2338.46 487.878L2450.5 257.125L2517.13 122.044C2530.91 94.0968 2563.79 81.3535 2592.81 92.7144L2790.42 170.082C2817.17 180.559 2847.6 170.592 2862.98 146.315L2869.1 136.646C2893.2 98.6051 2949.05 99.6713 2971.67 138.604L2973.2 141.239C2991.56 172.834 3033.66 180.82 3062.31 158.144L3203.08 46.7422C3239.62 17.8321 3293.72 39.7706 3299.8 85.9591L3327.51 296.378C3333.63 342.871 3388.33 364.685 3424.77 335.165L3430.94 330.167C3460.74 306.018 3505.25 315.661 3522.38 349.983L3656.68 618.921C3669.61 644.821 3699.19 657.793 3727.01 649.76L3840 617.125";

      // y 平移到 baselineY（保持形状不缩放），然后按需平铺拼接到 horizontalDistance
      const shiftVector64Y = (dStr: string) => {
        const tokens = dStr.match(/[A-Za-z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
        if (!tokens) return dStr;

        const toNum = (n: number) => {
          const s = n.toFixed(3);
          return s.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
        };

        let isX = false;
        let lastCmd = "";
        const out: string[] = [];

        for (const t of tokens) {
          if (/^[A-Za-z]$/.test(t)) {
            lastCmd = t;
            out.push(t);
            isX = lastCmd !== "V";
            continue;
          }

          const num = Number(t);
          if (!Number.isFinite(num)) {
            out.push(t);
            continue;
          }

          if (lastCmd === "V") {
            out.push(toNum(baselineY + (num - VECTOR64_BASELINE_Y)));
            continue;
          }

          if (lastCmd === "H") {
            out.push(toNum(num));
            continue;
          }

          if (isX) out.push(toNum(num));
          else out.push(toNum(baselineY + (num - VECTOR64_BASELINE_Y)));

          isX = !isX;
        }

        return out.join(" ");
      };

      const designD = shiftVector64Y(baseD);
      const d = extendPath(designD, VECTOR64_WIDTH, horizontalDistance);
      journeyPath.setAttribute("d", d);
      solidFixedPath.setAttribute("d", d);

      // ── 路径生成与测量 ──────────────────────────────────────────────

      const stage4Width = stage4Wrapper.scrollWidth;
      const stage4Height = stage4Wrapper.clientHeight;

      // 虚线：内容层，跟随 scroll 自然滚动
      guideSvg.style.width = `${stage4Width}px`;
      guideSvg.style.height = `${stage4Height}px`;
      guideSvg.setAttribute("viewBox", `0 0 ${stage4Width} ${stage4Height}`);
      gsap.set(guideSvg, { opacity: 0, visibility: "visible" });

      // 实线：fixed clip 容器内，通过 translateX 同步内容滚动 + overflow:hidden 裁剪
      solidFixedSvg.style.width = `${stage4Width}px`;
      solidFixedSvg.style.height = `${stage4Height}px`;
      solidFixedSvg.setAttribute("viewBox", `0 0 ${stage4Width} ${stage4Height}`);
      gsap.set(solidClip, { opacity: 0, visibility: "visible" });

      // 实线路径不需要 strokeDashoffset（clip 裁剪天然形成绘制效果）
      // 完整路径始终存在，clip 窗口从左边缘到吉祥物位置

      // 预渲染：HUD 层元素默认隐藏
      gsap.set(mascot, { autoAlpha: 0, visibility: "visible" });

      // 固定 SVG 的 x quickSetter：与 #master-track 同步平移
      const setSolidX = gsap.quickSetter(solidFixedSvg, "x", "px");

      // 3D 翻转 + 横向平移全部合并为唯一 Timeline
      // 总滚动空间 = 400vh(3D剧场) + horizontalDistance(横向轨道)
      const totalScrollDistance = 400 + (horizontalDistance / window.innerWidth) * 100;

      // 吉祥物旋转层：JS 通过此类名注入滚动速度旋转
      const mascotRotationEl = mascot.querySelector(".js-mascot-rotation") as HTMLElement | null;
      const setMascotRotation = mascotRotationEl
        ? gsap.quickSetter(mascotRotationEl, "rotate", "deg")
        : null;

      // 旋转速度追踪（闭包变量，fly 段 onUpdate 中更新）
      let prevFlyP = 0;
      let mascotRotation = 0;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: masterContainer,
          start: "top top",
          end: () => `+=${totalScrollDistance}%`,
          pin: true,
          scrub: 0.5,
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

      // 停留阅读 Stage 3（节奏压缩：只保留极短缓冲）
      tl.to({}, { duration: 0.1 });

      // ─────────────────────────────────────────────────────────────
      // 第二部分：Stage 4 显形与飞行联动
      // ─────────────────────────────────────────────────────────────
      //
      // 坐标系对齐关键公式：
      //
      //   虚线（内容层）：screenX = wrapperOffset + contentX + trackX
      //   实线（HUD 层）：screenX = solidX + contentX
      //
      //   → 对齐条件：solidX = wrapperOffset + trackX
      //
      //   wrapperOffset = innerWidth（第一个胶片格 w-screen 的宽度）
      //   trackX 由 timeline 控制（reveal: 0→-lockOffset, fly: -lockOffset→end）

      const wrapperOffset = Math.round(window.innerWidth);
      const lockOffset = Math.round(window.innerWidth * 0.2);

      // fly 水平距离（px）
      const flyDistancePx = Math.max(0, horizontalDistance - lockOffset);
      const dur = Math.max(0.001, flyDistancePx / window.innerWidth);

      tl.to("#master-track", {
        x: -lockOffset,
        duration: 1,
        ease: "none",
      })
        // reveal 阶段：同步实线平移（跟 track 一起移动）
        .to(
          {},
          {
            duration: 1,
            ease: "none",
            onUpdate: function () {
              const p = this.progress();
              setSolidX(wrapperOffset - lockOffset * p);
            },
          },
          "<"
        )
        .addLabel("stage4-reveal")
        .addLabel("fly")
        .to(
          "#master-track",
          {
            x: -(lockOffset + flyDistancePx),
            duration: dur,
            ease: "none",
          },
          "fly"
        )
        // 轨道出现
        .to(guideSvg, { opacity: 1, duration: 0.8, ease: "power1.inOut" }, "fly")
        .to(solidClip, { opacity: 1, duration: 0.3 }, "fly")
        // 吉祥物出场
        .set(mascot, { autoAlpha: 1 }, "fly")
        // 实线平移 + 吉祥物旋转：由 fly tween progress 统一驱动
        .to(
          {},
          {
            duration: dur,
            ease: "none",
            onUpdate: function () {
              const p = this.progress(); // 局部进度 0→1

              // 1) 实线：solidX = wrapperOffset + trackX（px，不是弧长）
              setSolidX(wrapperOffset - lockOffset - p * flyDistancePx);

              // 2) 吉祥物旋转：基于滚动速度（帧间进度差）
              if (setMascotRotation) {
                const velocity = (p - prevFlyP) * 100;
                prevFlyP = p;
                const target = Math.max(-15, Math.min(15, velocity * 30));
                mascotRotation += (target - mascotRotation) * 0.12;
                setMascotRotation(mascotRotation);
              }
            },
          },
          "fly"
        )
        // fly 结束后隐藏
        .set([mascot, solidClip], { autoAlpha: 0 });
    },
    { scope: masterRef }
  );

  return (
    <main
      id="master-pin-container"
      ref={masterRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      {/* Landing 专属背景已挂载在胶片第一格内部 */}
      {/* 这里不再渲染全屏 Beams，避免干扰 Stage 4 的白色世界 */}
      <div className="absolute inset-0 z-0 pointer-events-none" />

      {/* 全局移动的主轨道：横向 Flex 容器 */}
      <div
        id="master-track"
        className="relative z-10 flex h-screen w-max"
        style={{ willChange: "transform" }}
      >
        {/* ── 胶片第一格：3D 剧场（Stage 1, 2, 3）── */}
        <div
          className="relative w-screen h-screen flex-shrink-0"
          style={{ perspective: "2000px" }}
        >
          {/* Landing 背景只挂在第一格里，横向平移后会"留在远处" */}
          <div className="absolute inset-0 z-0 pointer-events-none">
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

        {/* ── 胶片后续格子：Stage 4 散点排版 ── */}
        {/* Stage 4 总容器：白底、溢出隐藏（阻断向左泄露） */}
        <div
          id="stage4-wrapper"
          className="relative flex h-screen w-max flex-shrink-0 overflow-hidden bg-[#FAFAFA] items-stretch"
        >
          {/* 轨道层：精确覆盖 stage4-wrapper，width/height 由 JS 控制（不是 w-full，会受 flex 压缩） */}
          <svg
            id="guide-line-svg"
            className="absolute left-0 top-0 z-0 pointer-events-none"
            style={{ opacity: 0, visibility: "visible" }}
          >
            <path
              id="journey-path"
              fill="none"
              stroke="#d4d4d8"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
          </svg>

          {/* 轨道：虚线在内容层；实线在 HUD 层（clip 容器） */}

          {/* 【顶层】作品数据渲染层 */}
          {works.map((work, index) => (
            <WorkCanvas
              key={work.id}
              work={work}
              index={index}
              className={work.width}
            />
          ))}
        </div>
      </div>

      {/* HUD 层：实线 clip 容器 + 固定吉祥物，均不跟 master-track 平移 */}
      <div
        id="stage4-hud"
        className="pointer-events-none absolute inset-0 z-50"
      >
        {/* 实线 clip：fixed 定位 + overflow-hidden，只露出 0→20vw 窗口 */}
        <div
          id="solid-line-clip"
          className="fixed top-0 h-full overflow-hidden pointer-events-none"
          style={{ left: 0, width: "20vw", opacity: 0, visibility: "visible" }}
        >
          <svg
            id="solid-line-fixed-svg"
            className="absolute left-0 top-0"
            style={{ willChange: "transform" }}
          >
            <path
              id="journey-path-fixed-fill"
              fill="none"
              stroke="#09090b"
              strokeWidth="2"
            />
          </svg>
        </div>

        <FlyingMascot id="flying-mascot" />
      </div>

      {/* 右下角进度指示器（仅在 Works 区域可见） */}
      <WorksProgress worksLength={works.length} />
    </main>
  );
}
