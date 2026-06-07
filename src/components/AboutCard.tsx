"use client";

import React from "react";
import type { AboutCard } from "@/data/about-cards";

/**
 * 单张 About Me 散落卡片
 * - 外层：浮动动画（translateY）
 * - 内层：倾斜（rotate）+ 玻璃质感
 * - 底部橙色细线呼应轨道
 */
export default function AboutMeCard({ card }: { card: AboutCard }) {
  const floatDelay = `${(parseInt(card.id.slice(2)) || 1) * 0.8}s`;
  const floatDuration = `${4 + (parseInt(card.id.slice(2)) || 1) * 0.5}s`;

  return (
    <div
      id={`about-card-${card.id}`}
      className="reveal-item relative flex-shrink-0 pointer-events-auto select-none z-[3]"
      style={{
        height: "100vh",
        display: "flex",
        alignItems: card.position === "above" ? "flex-start" : "flex-end",
        paddingTop: card.position === "above" ? "6vh" : undefined,
        paddingBottom: card.position === "below" ? "6vh" : undefined,
        marginLeft: card.offsetX || undefined,
      }}
    >
      {/* 浮动动画层 */}
      <div
        style={{
          width: card.width,
          animation: `about-card-float ${floatDuration} ease-in-out infinite`,
          animationDelay: floatDelay,
        }}
      >
        {/* 倾斜 + 玻璃质感层 */}
        <div
          style={{
            background: "rgba(253,248,237,0.75)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: "16px",
            padding: "24px 22px 20px",
            transform: `rotate(${card.tilt}deg)`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          }}
        >
          {/* emoji */}
          <div style={{ fontSize: "28px", marginBottom: "8px", lineHeight: 1 }}>
            {card.emoji}
          </div>

          {/* 标题 */}
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#1a1a1a",
              marginBottom: "10px",
              letterSpacing: "0.02em",
            }}
          >
            {card.title}
          </h3>

          {/* 描述 */}
          <p
            style={{
              fontSize: "13px",
              lineHeight: 1.7,
              color: "rgba(0,0,0,0.65)",
              marginBottom: "14px",
            }}
          >
            {card.description}
          </p>

          {/* 标签 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
            {card.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "11px",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: "rgba(255,77,0,0.08)",
                  color: "#FF4D00",
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* GitHub 链接 */}
          {card.link && (
            <a
              href={card.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "#FF4D00",
                textDecoration: "none",
                fontWeight: 600,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "0.7";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = "1";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              {card.linkLabel || card.link}
            </a>
          )}

          {/* 底部橙色线 */}
          <div
            style={{
              width: "40px",
              height: "2px",
              background: "#FF4D00",
              borderRadius: "1px",
              marginTop: "4px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
