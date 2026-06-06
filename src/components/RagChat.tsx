"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

let globalSetOpen: ((v: boolean) => void) | null = null;

export function openRagChat() {
  globalSetOpen?.(true);
}

export default function RagChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const animatingRef = useRef(false);

  useEffect(() => {
    globalSetOpen = setOpen;
    return () => {
      globalSetOpen = null;
    };
  }, []);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      animatingRef.current = true;
      const id = setTimeout(() => {
        animatingRef.current = false;
        inputRef.current?.focus({ preventScroll: true });
      }, 350);
      return () => clearTimeout(id);
    }
  }, [open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (question: string) => {
    if (!question.trim() || loading) return;

    setLoading(true);
    const newMessages: Message[] = [...messages, { role: "user", content: question }];
    setMessages(newMessages);
    setInput("");

    const history = newMessages
      .slice(-14)
      .filter((m) => m.content.length > 0);

    try {
      const response = await fetch("/api/rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
      });

      if (!response.ok) {
        setMessages([...newMessages, { role: "assistant", content: "抱歉，出了点问题，请稍后再试。" }]);
        setLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setMessages([...newMessages, { role: "assistant", content: "抱歉，出了点问题，请稍后再试。" }]);
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const { text } = JSON.parse(line.slice(6));
              assistantContent += text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            } catch {
              // ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].role === "assistant" && updated[updated.length - 1].content === "") {
          updated[updated.length - 1] = { role: "assistant", content: "抱歉，出了点问题，请稍后再试。" };
        } else {
          updated.push({ role: "assistant", content: "抱歉，出了点问题，请稍后再试。" });
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop overlay — click to close */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 199,
          pointerEvents: "auto",
          touchAction: "none",
          background: "transparent",
        }}
        onClick={() => setOpen(false)}
        onWheel={(e) => e.stopPropagation()}
      />

      <div
        style={{
          position: "fixed",
          left: "calc(25vw + 36px)",
          bottom: "calc(25vh + 36px)",
          width: "380px",
          height: "480px",
          display: "flex",
          flexDirection: "column",
          background: "rgba(20,20,20,0.5)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
          zIndex: 200,
          overflow: "hidden",
          pointerEvents: "auto",
          userSelect: "text",
          animation: "rag-panel-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Ask 马子航
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="关闭对话"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "none";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div
          className="rag-messages"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overscrollBehavior: "contain",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "13px",
                textAlign: "center",
                marginTop: "40px",
                lineHeight: 1.6,
              }}
            >
              你可以问我关于教育背景、工作经历、技能、项目经验等问题。
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background:
                    msg.role === "user"
                      ? "#FF4D00"
                      : "rgba(255,255,255,0.1)",
                  color: "#fff",
                  ...(msg.role === "user"
                    ? { borderBottomRightRadius: "4px", borderBottomLeftRadius: "12px" }
                    : { borderBottomLeftRadius: "4px", borderBottomRightRadius: "12px" }),
                }}
              >
                {msg.content || (
                  loading && i === messages.length - 1 ? (
                    <span style={{ display: "flex", gap: "4px", alignItems: "center", padding: "2px 0" }}>
                      <span className="rag-dot" style={{ animationDelay: "0s" }} />
                      <span className="rag-dot" style={{ animationDelay: "0.2s" }} />
                      <span className="rag-dot" style={{ animationDelay: "0.4s" }} />
                    </span>
                  ) : null
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator when waiting for first token */}
          {loading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  borderBottomLeftRadius: "4px",
                  borderBottomRightRadius: "12px",
                  background: "rgba(255,255,255,0.1)",
                }}
              >
                <span style={{ display: "flex", gap: "4px", alignItems: "center", padding: "2px 0" }}>
                  <span className="rag-dot" style={{ animationDelay: "0s" }} />
                  <span className="rag-dot" style={{ animationDelay: "0.2s" }} />
                  <span className="rag-dot" style={{ animationDelay: "0.4s" }} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px 16px",
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入问题……"
            disabled={loading}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "24px",
              padding: "10px 18px",
              color: "#fff",
              fontSize: "13px",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#FF4D00";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            aria-label="发送"
            style={{
              flexShrink: 0,
              width: "38px",
              height: "38px",
              borderRadius: "20px",
              border: "none",
              cursor: loading || !input.trim() ? "default" : "pointer",
              background: loading || !input.trim() ? "rgba(255,255,255,0.08)" : "#FF4D00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s, transform 0.15s",
              opacity: loading || !input.trim() ? 0.4 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading && input.trim()) {
                (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2 8L14 2L8 14L6.5 9.5L2 8Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes rag-panel-in {
            from {
              opacity: 0;
              transform: translateY(12px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .rag-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: rgba(255,255,255,0.4);
            animation: rag-dot-pulse 1.4s ease-in-out infinite;
          }
          @keyframes rag-dot-pulse {
            0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1); }
          }
          .rag-messages::-webkit-scrollbar { width: 4px; }
          .rag-messages::-webkit-scrollbar-track { background: transparent; }
          .rag-messages::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.15);
            border-radius: 2px;
          }
          .rag-messages::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.25);
          }
        `,
        }}
      />
    </>,
    document.body,
  );
}
