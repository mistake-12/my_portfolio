/** 吉祥物对话气泡事件系统 */

import { mascotQuotes } from "@/data/mascot-quotes";

let shownIndices = new Set<number>();

export function getRandomQuote(): string {
  // 一轮内不重复：所有语录轮完一遍后才重置
  const remaining = mascotQuotes
    .map((_, i) => i)
    .filter(i => !shownIndices.has(i));
  if (remaining.length === 0) {
    shownIndices.clear();
    // Guard: if still empty after clear (empty quotes array), return fallback
    if (mascotQuotes.length === 0) return "暂无语录";
    return getRandomQuote();
  }
  const idx = remaining[Math.floor(Math.random() * remaining.length)];
  shownIndices.add(idx);
  return mascotQuotes[idx];
}

type Listener = (msg: string, force?: boolean) => void;
let listeners: Listener[] = [];

export function showMascotMessage(msg: string, force = false) {
  listeners.forEach((fn) => fn(msg, force));
}

export function onMascotMessage(fn: Listener) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
