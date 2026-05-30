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
import Clouds from "@/components/Clouds";
import CategoryIntro from "@/components/CategoryIntro";
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

      const clouds = stage4Wrapper?.querySelector("#stage4-clouds") as HTMLElement | null;

      // 收集所有 WorkCanvas 的 DOM 引用 + 其内部需要触发入场动画的元素
      const workEntries = works.map((w) => {
        const el = document.querySelector(`#work-${w.id}`) as HTMLElement | null;
        const revealItems = el
          ? (el.querySelectorAll(".reveal-item, .view-link") as NodeListOf<HTMLElement>)
          : null;
        return { el, revealItems, visible: false, timeoutId: 0, revealed: false };
      });

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
        !mascot ||
        !clouds
      )
        return;

      // ── 轨道尺寸与路径计算（被 setup 和 resize 共用） ──
      const VECTOR64_WIDTH = 3840;
      const VECTOR64_BASELINE_Y = 617.125;

      const baseD =
        "M0 617.125L177.275 460.241C198.189 441.732 229.108 440.101 251.854 456.307L357.259 531.405C385.529 551.547 424.942 543.569 443.153 514.018L500.973 420.198C515.706 396.291 574.113 414.134 599 401.125C640.518 379.423 654.27 355.94 665.024 328.933C676.677 299.669 708.568 286.453 737.679 298.486L741.145 299.918C772.503 312.88 808.361 297.28 820.256 265.502L901.436 48.6277C917.08 6.83563 971.247 -3.86286 1001.6 28.8435L1042.53 72.9355C1073.21 105.992 1128.03 94.6461 1143.07 52.1254L1147.18 40.4982C1164.33 -7.97377 1230.51 -13.8388 1255.92 30.8628L1370 231.625L1458.54 376.332C1475.49 404.051 1511.44 413.231 1539.61 397.041L1646.83 335.424C1679.57 316.614 1721.33 332.347 1733.52 368.078L1796.69 553.301C1813.81 603.496 1882.86 608.427 1906.94 561.174L1914.92 545.499C1932.39 511.224 1977.14 502.008 2006.73 526.592L2117.08 618.287C2139.56 636.967 2172.24 636.729 2194.44 617.721L2323.5 507.255C2329.77 501.892 2334.86 495.296 2338.46 487.878L2450.5 257.125L2517.13 122.044C2530.91 94.0968 2563.79 81.3535 2592.81 92.7144L2790.42 170.082C2817.17 180.559 2847.6 170.592 2862.98 146.315L2869.1 136.646C2893.2 98.6051 2949.05 99.6713 2971.67 138.604L2973.2 141.239C2991.56 172.834 3033.66 180.82 3062.31 158.144L3203.08 46.7422C3239.62 17.8321 3293.72 39.7706 3299.8 85.9591L3327.51 296.378C3333.63 342.871 3388.33 364.685 3424.77 335.165L3430.94 330.167C3460.74 306.018 3505.25 315.661 3522.38 349.983L3656.68 618.921C3669.61 644.821 3699.19 657.793 3727.01 649.76L3840 617.125";

      const shiftVector64Y = (dStr: string, baselineY: number) => {
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

      /** 刷新轨道 SVG 尺寸与路径，尺寸变化时调用 */
      function refreshTrackDimensions() {
        const hd = masterTrack.scrollWidth - window.innerWidth;
        const by = window.innerHeight * 0.75;

        const designD = shiftVector64Y(baseD, by);
        const d = extendPath(designD, VECTOR64_WIDTH, hd);
        journeyPath.setAttribute("d", d);
        solidFixedPath.setAttribute("d", d);

        const sw = stage4Wrapper.scrollWidth;
        const sh = stage4Wrapper.clientHeight;

        guideSvg.style.width = `${sw}px`;
        guideSvg.style.height = `${sh}px`;
        guideSvg.setAttribute("viewBox", `0 0 ${sw} ${sh}`);
        gsap.set(guideSvg, { opacity: 0, visibility: "visible" });

        solidFixedSvg.style.width = `${sw}px`;
        solidFixedSvg.style.height = `${sh}px`;
        solidFixedSvg.setAttribute("viewBox", `0 0 ${sw} ${sh}`);
        gsap.set(solidClip, { opacity: 0, visibility: "visible" });

        return hd;
      }

      refreshTrackDimensions();

      // 实线路径不需要 strokeDashoffset（clip 裁剪天然形成绘制效果）
      // 完整路径始终存在，clip 窗口从左边缘到吉祥物位置

      // 预渲染：HUD 层元素默认隐藏
      gsap.set([mascot, clouds], { opacity: 0, visibility: "hidden" });

      // 固定 SVG 的 x quickSetter：与 #master-track 同步平移
      const setSolidX = gsap.quickSetter(solidFixedSvg, "x", "px");

      // 3D 翻转 + 横向平移全部合并为唯一 Timeline
      // 总滚动空间 = 400vh(3D剧场) + horizontalDistance(横向轨道)，end 由动态函数计算

      // 吉祥物旋转层：JS 通过此类名注入滚动速度旋转
      const mascotRotationEl = mascot.querySelector(".js-mascot-rotation") as HTMLElement | null;
      const setMascotRotation = mascotRotationEl
        ? gsap.quickSetter(mascotRotationEl, "rotate", "deg")
        : null;

      // 旋转速度追踪（闭包变量，fly 段 onUpdate 中更新）
      let prevFlyP = 0;
      let mascotRotation = 0;

      // 云朵惯性甩尾：延迟查询 DOM元素 + weight
      let cloudEls: HTMLElement[] = [];
      let cloudWeights: number[] = [];
      let cloudsReady = false;
      let cloudLogFrame = 0;

      // 案例卡片惯性甩尾（数值为云朵的 1/2）
      let workCardEls: HTMLElement[] = [];
      let workCardWeights: number[] = [];
      let workCardsReady = false;

      const ensureCloudsReady = () => {
        if (cloudsReady) return;
        const els = clouds?.querySelectorAll<HTMLElement>("[data-cloud]");
        if (els && els.length > 0) {
          cloudEls = Array.from(els);
          cloudWeights = cloudEls.map((el) => parseFloat(el.getAttribute("data-weight") || "1"));
          cloudsReady = true;
          console.log("[CloudSpring] ready, found", cloudEls.length, "clouds");
        }
      };

      const widthVwMap: Record<string, number> = {
        "w-[40vw]": 40, "w-[45vw]": 45, "w-[55vw]": 55,
        "w-[60vw]": 60, "w-[70vw]": 70, "w-[75vw]": 75,
        "w-[80vw]": 80, "w-[85vw]": 85,
      };

      const ensureWorkCardsReady = () => {
        if (workCardsReady) return;
        const els = document.querySelectorAll<HTMLElement>("[id^='work-']");
        if (els && els.length > 0) {
          workCardEls = Array.from(els);
          workCardWeights = workCardEls.map((el) => {
            // 从 width class 推算 weight（范围 0.67 ~ 1.42，大卡片惯性更大）
            for (const [cls, vw] of Object.entries(widthVwMap)) {
              if (el.classList.contains(cls)) return vw / 60;
            }
            return 1;
          });
          // 设置 CSS transition 用于回弹
          workCardEls.forEach((el, i) => {
            const w = workCardWeights[i];
            el.style.transition = `transform ${0.6 + w * 0.6}s cubic-bezier(0.34, 1.56, 0.64, 1)`;
            el.style.willChange = "transform";
          });
          workCardsReady = true;
          console.log("[WorkSpring] ready, found", workCardEls.length, "cards");
        }
      };

      // 文字入场：仅在向右滚动进入视口时触发一次，向左滚动不反转
      const updateWorkVisibility = () => {
        workEntries.forEach((we) => {
          if (!we.el || we.revealed) return;
          const rect = we.el.getBoundingClientRect();
          const inView = rect.right > 100 && rect.left < window.innerWidth - 100;
          if (inView && !we.visible) {
            we.visible = true;
            we.timeoutId = window.setTimeout(() => {
              we.revealed = true;
              if (we.revealItems) {
                we.revealItems.forEach((item) => item.classList.add("is-visible"));
              }
            }, 100);
          }
        });
      };

      function buildTimeline() {
        const newTl = gsap.timeline({
          scrollTrigger: {
            trigger: masterContainer,
            start: "top top",
            end: () => {
              const hd = masterTrack.scrollWidth - window.innerWidth;
              return `+=${400 + (hd / window.innerWidth) * 100}%`;
            },
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
      newTl.to("#stage1", {
        scale: 1.5,
        rotateX: 60,
        opacity: 0,
        filter: "blur(20px)",
        pointerEvents: "none",
        duration: 1,
        ease: "power2.inOut",
      });

      // Stage 2: 交叉淡入（Stage 1 消失后半段提前进入）
      newTl.fromTo(
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
      newTl.call(() => {
        gsap.set("#stage3", { rotateX: 90, opacity: 0 });
      });

      // Stage 2 → Stage 3：3D 翻转
      // 翻转前半段：Stage 2 翻转到 -90deg 消失
      newTl.to(
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
      newTl.fromTo(
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
      newTl.to({}, { duration: 0.1 });

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

      const lockOffset = Math.round(window.innerWidth * 0.1);

      // fly 水平距离（px），动态读取确保 resize 后自动更新
      const getFlyDistancePx = () =>
        Math.max(0, (masterTrack.scrollWidth - window.innerWidth) - window.innerWidth * 0.1);
      const flyDistancePx = getFlyDistancePx();
      const dur = Math.max(0.001, flyDistancePx / window.innerWidth);

      newTl.to("#master-track", {
        x: () => -(window.innerWidth * 0.1),
        duration: 1,
        ease: "none",
      })
        // reveal 阶段：同步实线平移 + 跟踪可见作品
        .to(
          {},
          {
            duration: 1,
            ease: "none",
            onUpdate: function () {
              const p = this.progress();
              const lo = window.innerWidth * 0.1;
              const trackX = -lo * p;
              setSolidX(window.innerWidth + trackX);
              updateWorkVisibility();
            },
          },
          "<"
        )
        .addLabel("stage4-reveal")
        .addLabel("fly")
        .to(
          "#master-track",
          {
            x: () => {
              const lo = window.innerWidth * 0.1;
              const fly = Math.max(0, (masterTrack.scrollWidth - window.innerWidth) - lo);
              return -(lo + fly);
            },
            duration: dur,
            ease: "none",
          },
          "fly"
        )
        // 轨道出现
        .to(guideSvg, { opacity: 1, duration: 0.8, ease: "power1.inOut" }, "fly")
        .to(solidClip, { opacity: 1, duration: 0.3 }, "fly")
        // 吉祥物 + 云朵出场
        .set([mascot, clouds], { opacity: 1, visibility: "visible" }, "fly")
        // 实线平移 + 吉祥物旋转 + 作品可见性：由 fly tween progress 统一驱动
        .to(
          {},
          {
            duration: dur,
            ease: "none",
            onUpdate: function () {
              const p = this.progress(); // 局部进度 0→1
              const lo = window.innerWidth * 0.1;
              const fly = Math.max(0, (masterTrack.scrollWidth - window.innerWidth) - lo);
              const trackX = -(lo + p * fly);

              // 1) 实线：solidX = wrapperOffset + trackX
              setSolidX(window.innerWidth + trackX);

              // 2) 帧间滚动速度（在更新 prevFlyP 之前计算，供吉祥物和云朵共用）
              const velocity = (p - prevFlyP) * 200;
              const cardVelocity = (p - prevFlyP) * 150;
              prevFlyP = p;

              // 吉祥物旋转
              if (setMascotRotation) {
                const target = Math.max(-15, Math.min(15, velocity * 30));
                mascotRotation += (target - mascotRotation) * 0.12;
                setMascotRotation(mascotRotation);
              }

              // 3) 云朵惯性甩尾：直接设偏移量，CSS transition 负责平滑和回弹
              ensureCloudsReady();
              if (cloudEls.length > 0) {
                cloudLogFrame++;
                if (cloudLogFrame % 30 === 0) {
                  console.log("[CloudSpring] velocity:", velocity.toFixed(3), "offset[0]:", (velocity * cloudWeights[0] * 300).toFixed(1));
                }
                for (let i = 0; i < cloudEls.length; i++) {
                  const weight = cloudWeights[i];
                  const offset = Math.max(-80, Math.min(80, velocity * weight * 300));
                  cloudEls[i].style.transform = `translateX(${offset.toFixed(1)}px)`;
                }
              }

              // 3.5) 案例卡片惯性甩尾（数值为云朵的 1/2）
              ensureWorkCardsReady();
              if (workCardEls.length > 0) {
                for (let i = 0; i < workCardEls.length; i++) {
                  const weight = workCardWeights[i];
                  const offset = Math.max(-40, Math.min(40, cardVelocity * weight * 125));
                  workCardEls[i].style.transform = `translateX(${offset.toFixed(1)}px)`;
                }
              }

              // 4) 作品可见性：触发文字入场动画
              updateWorkVisibility();
            },
          },
          "fly"
        )
        // fly 结束后隐藏
        .set([mascot, solidClip, clouds], { opacity: 0 });

        return newTl;
      }

      const tl = buildTimeline();

      // 窗口缩放/resize：保存进度 → 刷新轨道 → ScrollTrigger.refresh() → 恢复位置
      // invalidateOnRefresh:true + 函数式 tween 值确保所有 innerWidth 依赖自动更新
      let resizeTimer: ReturnType<typeof setTimeout>;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const progress = tl.scrollTrigger ? tl.scrollTrigger.progress : 0;
          refreshTrackDimensions();
          ScrollTrigger.refresh();
          const st = tl.scrollTrigger;
          if (st) {
            const targetY = st.start + progress * (st.end - st.start);
            // @ts-ignore
            const lenis = window.lenis;
            if (lenis && typeof lenis.scrollTo === "function") {
              lenis.scrollTo(targetY, { immediate: true });
            } else {
              window.scrollTo(0, targetY);
            }
          }
        }, 300);
      });
    },
    { scope: masterRef }
  );

  return (
    <main
      id="master-pin-container"
      ref={masterRef}
      className="relative h-screen w-full overflow-hidden bg-[#2E2E2E]"
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
          className="relative flex h-screen w-max flex-shrink-0 overflow-hidden bg-[#FDF8ED] z-[4]"
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
              strokeWidth="1.8"
              strokeDasharray="8 8"
            />
          </svg>

          {/* 轨道：虚线在内容层；实线在 HUD 层（clip 容器） */}

          {/* 云朵装饰层：沿轨道散布，z-[1] 在轨道之上、作品之下 */}
          <Clouds id="stage4-clouds" className="z-[1]" />

          {/* 【顶层】分类 + 作品渲染 */}
          {/* 分组渲染：每组前面插入对应 CategoryIntro */}
          {(() => {
            // 按分类分组
            const categoryOrder = [
              { id: "industrial", title: "工业设计", subtitle: "Human-centered industrial design — where form, function and emotion converge at the scale of human experience. Every object begins with understanding how people live, feel, and connect." },
              { id: "software", title: "软件开发", subtitle: "Product-thinking driven software development — beyond interfaces and codebases. Rooted in user scenarios, balanced between business intent and technical constraints, every interaction carries a clear product purpose." },
              { id: "internship", title: "实习经历", subtitle: "Hands-on internship experience — bridging academic knowledge with industry practice. Real projects, real teams, and real impact across design and development disciplines." },
              { id: "other", title: "其他项目", subtitle: "Other projects — exploring diverse creative territories beyond defined categories. Experiments, collaborations, and side explorations that expand the boundaries of design and development." },
            ] as const;
            const elements: React.ReactNode[] = [];
            let globalIndex = 0;

            categoryOrder.forEach(cat => {
              elements.push(
                <CategoryIntro
                  key={`cat-${cat.id}`}
                  id={`category-${cat.id}`}
                  title={cat.title}
                  subtitle={cat.subtitle}
                />
              );
              works
                .filter(w => w.categoryId === cat.id)
                .forEach(w => {
                  elements.push(
                    <WorkCanvas
                      key={w.id}
                      work={w}
                      index={globalIndex++}
                      className={w.width}
                    />
                  );
                });
            });
            // 自我介绍引导页（在所有作品之后）
            elements.push(
              <CategoryIntro
                key="cat-about"
                id="category-about"
                title="About Me"
                textPosition="top-right"
                cloudSlots={[
                  { left: "8%", top: "25%", scale: 0.85, delay: 0 },
                  { right: "15%", top: "12%", scale: 1.1, delay: 5 },
                  { left: "20%", bottom: "15%", scale: 0.7, delay: 2 },
                  { right: "8%", bottom: "30%", scale: 0.95, delay: 8 },
                ]}
              />
            );
            // 空白引导页
            elements.push(
              <CategoryIntro
                key="cat-blank"
                id="category-blank"
                title=""
                hideLine
                cloudSlots={[
                  { left: "5%", top: "12%", scale: 1.2, delay: 0 },
                  { right: "5%", top: "30%", scale: 0.75, delay: 6 },
                  { left: "25%", bottom: "20%", scale: 0.9, delay: 4 },
                  { right: "20%", bottom: "12%", scale: 1.05, delay: 9 },
                ]}
              />
            );
            return elements;
          })()}
        </div>
      </div>

      {/* HUD 层：实线 clip 容器 + 固定吉祥物，均不跟 master-track 平移 */}
      <div
        id="stage4-hud"
        className="pointer-events-none absolute inset-0 z-50"
      >
        {/* 实线 clip：fixed 定位 + overflow-hidden，只露出 0→20vw 窗口，z-[2] 在内容之下 */}
        <div
          id="solid-line-clip"
          className="fixed top-0 h-full overflow-hidden pointer-events-none z-[2]"
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
              stroke="#FF4D00"
              strokeWidth="1.8"
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
