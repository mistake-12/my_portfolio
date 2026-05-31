"use client";

import { forwardRef, useEffect, useState } from "react";
import { onMascotMessage } from "@/lib/mascot-events";

interface FlyingMascotProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

const FlyingMascot = forwardRef<HTMLDivElement, FlyingMascotProps>(
  ({ id, className = "", style }, ref) => {
    const [bubbleMsg, setBubbleMsg] = useState("");
    const [bubbleVisible, setBubbleVisible] = useState(false);

    useEffect(() => {
      return onMascotMessage((msg) => {
        setBubbleMsg(msg);
        setBubbleVisible(true);
        setTimeout(() => setBubbleVisible(false), 4000);
      });
    }, []);

    return (
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
      {/* 对话气泡 */}
      {bubbleVisible && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "12px",
            background: "rgba(24,24,27,0.92)",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            lineHeight: "1.5",
            whiteSpace: "nowrap",
            maxWidth: "420px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            animation: "bubble-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {bubbleMsg}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid rgba(24,24,27,0.92)",
            }}
          />
        </div>
      )}

      {/* 旋转层 */}
      <div className="js-mascot-rotation" style={{ willChange: "transform" }}>
        {/* 空闲浮动 */}
        <div
          className="relative"
          style={{
            width: "48px",
            height: "48px",
            animation: "mascot-float 3s ease-in-out infinite",
          }}
        >
          <div
            className="absolute inset-0 rounded-xl border-2 bg-white"
            style={{ borderColor: "#18181b" }}
          />
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
          <div className="absolute inset-x-0 top-0 flex justify-center gap-1.5 pt-2.5">
            <div
              className="relative"
              style={{
                width: "7px",
                height: "7px",
                animation: "mascot-blink 5s infinite",
              }}
            >
              <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "#18181b" }} />
              <div
                className="absolute rounded-full bg-white"
                style={{ width: "2px", height: "2px", right: "1px", top: "1px" }}
              />
            </div>
            <div
              className="relative"
              style={{
                width: "7px",
                height: "7px",
                marginTop: "-2px",
                animation: "mascot-blink 5s 0.15s infinite",
              }}
            >
              <div className="absolute inset-0 rounded-full" style={{ backgroundColor: "#18181b" }} />
              <div
                className="absolute rounded-full bg-white"
                style={{ width: "2px", height: "2px", right: "1px", top: "1px" }}
              />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-2">
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="relative" style={{ top: "-2px" }}>
              <path d="M3 2 Q7 7 11 2" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>
      </div>

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
          @keyframes bubble-in {
            from { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.95); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          }
        `,
        }}
      />
    </div>
    );
  },
);

FlyingMascot.displayName = "FlyingMascot";

export default FlyingMascot;
