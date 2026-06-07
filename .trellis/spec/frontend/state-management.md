# State Management

> How state is managed in this project.

---

## Overview

**No state management library.** This project uses only React's built-in state primitives. There is no Redux, Zustand, Jotai, MobX, or similar. Server state is not cached — every API call fetches fresh data.

---

## State Categories

### Local Component State (`useState`)

All UI state is local. `useState` is the only state hook used:

```tsx
// src/components/NavBar.tsx
const [dropdownOpen, setDropdownOpen] = useState(false);

// src/components/RagChat.tsx
const [open, setOpen] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);

// src/components/LoadingScreen.tsx
const [progress, setProgress] = useState(0);
const [visible, setVisible] = useState(true);
```

### Module-Level Shared State

Cross-component/instance communication uses **module-scoped variables** (closures), not React Context:

```tsx
// src/components/RagChat.tsx — global setter
let globalSetOpen: ((v: boolean) => void) | null = null;

export function openRagChat() {
  globalSetOpen?.(true);
}

export default function RagChat() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    globalSetOpen = setOpen;
    return () => { globalSetOpen = null; };
  }, []);
}
```

```ts
// src/lib/mascot-events.ts — pub/sub event system
let shownIndices = new Set<number>();
type Listener = (msg: string, force?: boolean) => void;
let listeners: Listener[] = [];

export function showMascotMessage(msg: string, force = false) {
  listeners.forEach((fn) => fn(msg, force));
}

export function onMascotMessage(fn: Listener) {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
}
```

### Window Globals

Lenis smooth scrolling instance is accessed via `window.lenis`:
```ts
// @ts-ignore
const lenis = window.lenis;
if (lenis && typeof lenis.scrollTo === "function") {
  lenis.scrollTo(targetY, { immediate: true });
}
```

### URL State

No URL search params, no router state. The entire page is a single scroll-driven experience — no client-side routing between views.

---

## Server State

**No caching.** Every API call (RAG chat) fetches fresh data. No optimistic updates, no stale-while-revalidate. The only server interaction is the RAG chat endpoint at `/api/rag/chat`.

Static data (`src/data/*.ts`) is imported directly and bundled at build time:
```tsx
import { profile } from "@/data/profile";
import { works } from "@/data/works";
```

---

## When to Use What (Decision Rules)

| State Type | Solution | Example |
|-----------|---------|---------|
| Single-component UI state | `useState` | Dropdown open/close, input value |
| Cross-component imperative action | Module-level variable | `openRagChat()` called from `FlyingMascot`, consumed by `RagChat` |
| Cross-component event broadcast | Pub/sub (`listeners` array) | Mascot bubble messages |
| Smooth scroll instance | `window.lenis` global | GSAP resize handler, scrollToCategory |
| Static reference data | `src/data/` TypeScript modules | Works, profile, disciplines |

---

## What is NOT Used

- ❌ React Context (`createContext`, `useContext`)
- ❌ `useReducer`
- ❌ Redux / Zustand / Jotai / MobX
- ❌ React Query / SWR / Apollo Client
- ❌ `next/router` or `useSearchParams`
- ❌ `localStorage` / `sessionStorage`

---

## Common Mistakes

### 尝试用 Context 传递状态

项目不使用 Context。跨组件通信使用模块级变量或 pub/sub。如果未来需要 Context（比如多页面共享认证状态），应遵循现有模式：最小化 Context 数量，优先考虑模块级变量。

### 忘记清理全局 setter

`globalSetOpen` 模式在组件卸载时必须设为 `null`，否则会造成内存泄漏和 stale closure 问题。当前 `RagChat.tsx` 通过 `useEffect` 的 cleanup 正确处理了这一点。
