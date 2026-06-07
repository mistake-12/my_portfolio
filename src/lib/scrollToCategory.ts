import { ScrollTrigger } from "gsap/ScrollTrigger";

/** 根据 CategoryIntro 元素的实际 DOM 位置（offsetLeft）计算滚动目标 */
export function scrollToCategory(target: string) {
  const innerW = window.innerWidth;
  const innerH = window.innerHeight;

  // 强制刷新 GSAP ScrollTrigger，确保所有 DOM 测量值是最新的
  // 修复：首次点击导航时图片未加载完导致 scrollWidth 不准确
  ScrollTrigger.refresh();

  // 直接读取目标引导页 DOM 元素的位置（id="category-{target}"）
  const targetEl = document.getElementById(`category-${target}`);
  if (!targetEl) return;

  // 读取 master-track 宽度，与 GSAP scrollTrigger end 公式保持一致
  const masterTrack = document.getElementById("master-track") as HTMLElement | null;
  const wrapper = document.getElementById("stage4-wrapper") as HTMLElement | null;

  // hd = masterTrack.scrollWidth - innerW，与 GSAP 中完全对齐
  // （等价于 stage4Width 当第一格 w-screen === innerW 时）
  const stage4Width = wrapper?.scrollWidth || innerW * 5;
  const hd = (masterTrack?.scrollWidth ?? (innerW + stage4Width)) - innerW;
  const lockOffset = innerW * 0.1;

  // CategoryIntro 在 #stage4-wrapper 内，用 offsetLeft 获取其相对于 stage4-wrapper 的像素位置
  const categoryPx = targetEl.offsetLeft;

  // 要让 100vw 的 CategoryIntro 填满视口：其左侧需对齐 0
  // stage4-wrapper 从 innerW 处开始（第一个 w-screen 占位）
  // GSAP translateX = 0 时，CategoryIntro 在 innerW + categoryPx 处
  // 需要 translateX = -(innerW + categoryPx)
  const targetTrackX = -(innerW + categoryPx);

  // ---- fly 阶段计算 ----
  // fly: masterTrack x 从 -lockOffset → -(lockOffset + flyDistPx)
  const flyDistPx = Math.max(1, hd - lockOffset);
  const flyDur = flyDistPx / innerW;

  // 总时间线常量（与 page.tsx GSAP 时间线完全对齐）
  const BEFORE_STAGE4_DUR = 2.8;
  const REVEAL_DUR = 1;
  const TOTAL_TIMELINE = BEFORE_STAGE4_DUR + REVEAL_DUR + flyDur;

  // totalScrollPx 公式必须与 GSAP scrollTrigger end 完全一致：
  //   end: `+=${400 + (hd / innerW) * 100 + 80}%`
  const totalScrollPx = (400 + (hd / innerW) * 100 + 80) * (innerH / 100);
  const pxPerUnit = totalScrollPx / TOTAL_TIMELINE;

  // reveal 结束时 trackX = -lockOffset，已覆盖 lockOffset 的平移
  // fly 阶段还需额外移动: |targetTrackX| - lockOffset
  const needFly = Math.max(0, Math.abs(targetTrackX) - lockOffset);
  const flyProgress = Math.min(1, needFly / flyDistPx);
  const targetTimeline = BEFORE_STAGE4_DUR + REVEAL_DUR + flyProgress * flyDur;
  const targetY = Math.round(targetTimeline * pxPerUnit);

  // ---- 调试日志（检查计算过程） ----
  console.log(
    `%c[scrollToCategory] %c${target}`,
    "color:#FF4D00;font-weight:bold",
    "color:#333",
    {
      innerW,
      innerH,
      categoryPx,
      hd,
      stage4Width: wrapper?.scrollWidth,
      lockOffset,
      targetTrackX,
      flyDistPx,
      flyDur,
      TOTAL_TIMELINE,
      totalScrollPx,
      pxPerUnit,
      needFly,
      flyProgress,
      targetTimeline,
      targetY,
    }
  );

  // 淡入遮罩
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:9999;background:#2E2E2E;opacity:0;transition:opacity 0.25s;pointer-events:none";
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.style.opacity = "1"; });

  // Lenis 平滑滚动
  // @ts-ignore
  const lenis = window.lenis;
  if (lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(targetY, { duration: 0.5, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
  } else {
    document.scrollingElement?.scrollTo({ top: targetY, behavior: "smooth" });
  }

  // 滚动到位后淡出遮罩
  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 300);
  }, 700);
}
