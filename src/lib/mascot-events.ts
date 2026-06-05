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
    return getRandomQuote();
  }
  const idx = remaining[Math.floor(Math.random() * remaining.length)];
  shownIndices.add(idx);
  return mascotQuotes[idx];
}

type Listener = (msg: string) => void;
let listeners: Listener[] = [];

export function showMascotMessage(msg: string) {
  listeners.forEach((fn) => fn(msg));
}

export function onMascotMessage(fn: Listener) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}
