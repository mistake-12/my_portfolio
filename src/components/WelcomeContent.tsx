"use client";

export default function WelcomeContent() {
  return (
    <section className="relative w-full h-full flex items-center justify-center p-6 md:p-12 overflow-hidden">

      {/* ── 四角 UI Chrome（保持 Unseen Studio 风格边框感） ── */}

      {/* 左上角 · 标识 */}
      <div className="absolute top-8 left-8 z-50 select-none">
        <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-zinc-500">
          [ J_M_2025 ]
        </span>
      </div>

      {/* 右上角 · 导航 */}
      <nav className="absolute top-8 right-8 z-50 select-none">
        <ul className="flex items-center gap-8">
          {["INDEX", "ABOUT", "WORK"].map((item) => (
            <li key={item}>
              <button className="font-mono text-[10px] tracking-[0.35em] uppercase text-zinc-500 hover:text-white transition-colors duration-300 cursor-pointer">
                [ {item} ]
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* 左下角 · 状态 */}
      <div className="absolute bottom-8 left-8 z-50 select-none">
        <span className="font-mono text-[10px] tracking-[0.35em] uppercase text-zinc-500">
          [ STATUS: AVAILABLE FOR FREELANCE ]
        </span>
      </div>

      {/* ── 主视觉 · 错落排版（无右下角 ScrollIndicator，由独立组件接管） ── */}

      {/* 主标题容器：占据屏幕大部分空间，利用 Flex 错开 */}
      <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center mix-blend-difference z-10 mt-12 -translate-y-8 md:-translate-y-12">

        {/* 上半部 JONY：强制靠左 */}
        <h1
          className="font-black tracking-tighter text-white self-start ml-4 md:ml-12"
          style={{
            fontFamily: "var(--font-syne), 'Syne', sans-serif",
            fontSize: "clamp(6rem, 18vw, 16rem)",
            lineHeight: 0.75,
            cursor: "default",
            WebkitTextStroke: "0px",
            WebkitTextFillColor: "#ffffff",
            transformOrigin: "left center",
          }}
        >
          JONY
        </h1>

        {/* 穿插的副标题：放在两行粗字中间偏右的位置，形成空间穿插 */}
        <span
          className="italic text-zinc-400 self-end mr-12 md:mr-32 my-4 md:my-0 relative z-20"
          style={{
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
            fontSize: "clamp(1.25rem, 2.5vw, 2.5rem)",
            letterSpacing: "0.06em",
          }}
        >
          Creative Designer
        </span>

        {/* 下半部 MA.：强制靠右 */}
        <h1
          className="font-black tracking-tighter text-white self-end mr-4 md:mr-12"
          style={{
            fontFamily: "var(--font-syne), 'Syne', sans-serif",
            fontSize: "clamp(6rem, 18vw, 16rem)",
            lineHeight: 0.75,
            cursor: "default",
            WebkitTextStroke: "0px",
            WebkitTextFillColor: "#ffffff",
            transformOrigin: "right center",
          }}
        >
          MA.
        </h1>

      </div>
    </section>
  );
}
