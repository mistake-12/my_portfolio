/** 吉祥物对话气泡事件系统 */

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
