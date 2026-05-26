"use client";

import { forwardRef } from "react";

interface FlyingMascotProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

const FlyingMascot = forwardRef<HTMLDivElement, FlyingMascotProps>(
  ({ id, className = "", style }, ref) => (
    <div
      ref={ref}
      id={id}
      className={`fixed pointer-events-none z-[100] ${className}`}
      style={{
        left: "20vw",
        top: "75vh",
        transform: "translate(-50%, -50%)",
        opacity: 0,
        ...style,
      }}
    >
      {/* 旋转层：JS 通过 querySelector('.js-mascot-rotation') 找到并注入 rotate */}
      <div className="js-mascot-rotation" style={{ willChange: "transform" }}>
        {/* 空闲浮动 + 角色内容 */}
        <div
          className="relative"
          style={{
            width: "48px",
            height: "48px",
            animation: "mascot-float 3s ease-in-out infinite",
          }}
        >
          {/* 主体：圆角矩形 */}
          <div
            className="absolute inset-0 rounded-xl border-2 bg-white"
            style={{ borderColor: "#18181b" }}
          />

          {/* 左翅/触角 */}
          <div
            className="absolute"
            style={{
              left: "-8px",
              top: "12px",
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderRight: "10px solid #18181b",
              transform: "rotate(-15deg)",
            }}
          />

          {/* 右翅/触角 */}
          <div
            className="absolute"
            style={{
              right: "-8px",
              top: "12px",
              width: 0,
              height: 0,
              borderTop: "6px solid transparent",
              borderBottom: "6px solid transparent",
              borderLeft: "10px solid #18181b",
              transform: "rotate(15deg)",
            }}
          />

          {/* 眼睛区域 */}
          <div className="absolute inset-x-0 top-0 flex justify-center gap-1.5 pt-2.5">
            {/* 左眼 */}
            <div
              className="relative"
              style={{
                width: "7px",
                height: "7px",
                animation: "mascot-blink 5s infinite",
              }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "#18181b" }}
              />
              <div
                className="absolute rounded-full bg-white"
                style={{
                  width: "2px",
                  height: "2px",
                  right: "1px",
                  top: "1px",
                }}
              />
            </div>

            {/* 右眼（稍高，不对称更生动） */}
            <div
              className="relative"
              style={{
                width: "7px",
                height: "7px",
                marginTop: "-2px",
                animation: "mascot-blink 5s 0.15s infinite",
              }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "#18181b" }}
              />
              <div
                className="absolute rounded-full bg-white"
                style={{
                  width: "2px",
                  height: "2px",
                  right: "1px",
                  top: "1px",
                }}
              />
            </div>
          </div>

          {/* 嘴：小弧线 */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-2">
            <svg
              width="14"
              height="8"
              viewBox="0 0 14 8"
              fill="none"
              className="relative"
              style={{ top: "-2px" }}
            >
              <path
                d="M3 2 Q7 7 11 2"
                stroke="#18181b"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* CSS 关键帧注入 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes mascot-float {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-8px); }
          }

          @keyframes mascot-blink {
            0%, 94%, 100% { transform: scaleY(1); }
            97%           { transform: scaleY(0.1); }
          }
        `,
        }}
      />
    </div>
  ),
);

FlyingMascot.displayName = "FlyingMascot";

export default FlyingMascot;
