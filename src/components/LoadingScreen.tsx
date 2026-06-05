"use client";

import { useEffect, useRef, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const totalRef = useRef(0);
  const loadedRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const tracked = new WeakSet<HTMLImageElement | HTMLVideoElement>();

    function trackElement(el: HTMLImageElement | HTMLVideoElement) {
      if (tracked.has(el)) return;
      tracked.add(el);
      totalRef.current++;

      const onDone = () => {
        if (doneRef.current) return;
        loadedRef.current++;
        const pct = Math.round((loadedRef.current / totalRef.current) * 100);
        setProgress(pct);
        if (loadedRef.current >= totalRef.current) {
          doneRef.current = true;
          // 最小展示 400ms，避免闪烁
          setTimeout(() => setVisible(false), 400);
        }
      };

      if (el.tagName === "VIDEO") {
        if ((el as HTMLVideoElement).readyState >= 2) {
          onDone();
        } else {
          el.addEventListener("loadeddata", onDone, { once: true });
        }
      } else {
        if ((el as HTMLImageElement).complete) {
          onDone();
        } else {
          el.addEventListener("load", onDone, { once: true });
          el.addEventListener("error", onDone, { once: true });
        }
      }
    }

    // 扫描当前 DOM
    function scan() {
      document.querySelectorAll<HTMLImageElement | HTMLVideoElement>("img, video").forEach(trackElement);
    }

    scan();

    // MutationObserver 监听后续插入的媒体元素
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    // 超时兜底：5 秒后无论如何淡出
    const timeout = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        setProgress(100);
        setTimeout(() => setVisible(false), 400);
      }
    }, 5000);

    return () => {
      mo.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        backgroundColor: "#2E2E2E",
        transition: "opacity 0.5s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* 轨道 */}
      <div
        style={{
          width: "200px",
          height: "1.5px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#FF4D00",
            transition: "width 0.3s ease",
            borderRadius: "2px",
          }}
        />
      </div>

      {/* 百分比 */}
      <p className="mt-3 text-xs font-mono tracking-wider text-zinc-400">
        {progress}%
      </p>
    </div>
  );
}
