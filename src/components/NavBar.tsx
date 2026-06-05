"use client";

import { useState, useRef } from "react";
import { scrollToCategory } from "@/lib/scrollToCategory";

const categories = [
  { label: "工业设计", target: "industrial" },
  { label: "软件开发", target: "software" },
  { label: "实习经历", target: "internship" },
  { label: "其他项目", target: "other" },
];

function scrollToHome() {
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:9999;background:#2E2E2E;opacity:0;transition:opacity 0.25s;pointer-events:none";
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.style.opacity = "1"; });

  // @ts-ignore
  const lenis = window.lenis;
  if (lenis && typeof lenis.scrollTo === "function") {
    lenis.scrollTo(0, { duration: 0.8, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
  } else {
    document.scrollingElement?.scrollTo({ top: 0, behavior: "smooth" });
  }

  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 300);
  }, 900);
}

export default function NavBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  return (
    <nav
      id="stage4-nav"
      className="pointer-events-auto fixed top-5 left-1/2 -translate-x-1/2 z-[60] select-none"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <ul className="flex items-center gap-8">
        {/* 主页 */}
        <li>
          <button
            onClick={scrollToHome}
            className="group cursor-pointer font-mono text-[14px] tracking-[0.35em] uppercase text-[#FF4D00] font-semibold"
          >
            <span className="inline-block text-[#FF4D00] transition-transform duration-300 group-hover:-translate-x-[7px]">「</span>
            <span className="inline-block text-[#FF4D00] transition-all duration-300 group-hover:tracking-[0.5em]"> 主页 </span>
            <span className="inline-block text-[#FF4D00] transition-transform duration-300 group-hover:translate-x-[7px]">」</span>
          </button>
        </li>

        {/* 作品 + 下拉菜单 */}
        <li
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className="group cursor-pointer font-mono text-[14px] tracking-[0.35em] uppercase text-[#FF4D00] font-semibold"
          >
            <span className="inline-block text-[#FF4D00] transition-transform duration-300 group-hover:-translate-x-[7px]">「</span>
            <span className="inline-block text-[#FF4D00] transition-all duration-300 group-hover:tracking-[0.5em]"> 作品 </span>
            <span className="inline-block text-[#FF4D00] transition-transform duration-300 group-hover:translate-x-[7px]">」</span>
          </button>

          {/* 下拉菜单：透明悬浮 */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-300 ${
              dropdownOpen
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            {categories.map((cat) => (
              <button
                key={cat.target}
                onClick={() => {
                  scrollToCategory(cat.target);
                  setDropdownOpen(false);
                }}
                className="group block whitespace-nowrap py-2 text-center font-mono text-[14px] tracking-[0.35em] text-[#FF4D00] font-semibold"
              >
                <span className="inline-block text-[#FF4D00] transition-transform duration-300 group-hover:-translate-x-[7px]">「</span>
                <span className="inline-block text-[#FF4D00] transition-all duration-300 group-hover:tracking-[0.5em]"> {cat.label} </span>
                <span className="inline-block text-[#FF4D00] transition-transform duration-300 group-hover:translate-x-[7px]">」</span>
              </button>
            ))}
          </div>
        </li>

        {/* 介绍 */}
        <li>
          <button
            onClick={() => scrollToCategory("about")}
            className="group cursor-pointer font-mono text-[14px] tracking-[0.35em] uppercase text-[#FF4D00] font-semibold"
          >
            <span className="inline-block text-[#FF4D00] transition-transform duration-300 group-hover:-translate-x-[7px]">「</span>
            <span className="inline-block text-[#FF4D00] transition-all duration-300 group-hover:tracking-[0.5em]"> 介绍 </span>
            <span className="inline-block text-[#FF4D00] transition-transform duration-300 group-hover:translate-x-[7px]">」</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
