# Hook Guidelines

> How hooks are used in this project.

---

## Overview

This project does **not** have a dedicated `/hooks/` directory. Custom hook logic lives inline within components. The only third-party hook is `useGSAP` from `@gsap/react`. Most logic is written directly inside component bodies.

---

## Custom Hook Inventory

The project contains **zero standalone custom hook files**. If hooks were to be extracted from existing components, these would be the candidates:

| Candidate Hook | Source File | What It Does |
|---------------|-------------|--------------|
| `useMediaLoadingProgress` | `LoadingScreen.tsx` | Tracks img/video load progress with MutationObserver + 10s timeout fallback |
| `useMascotBubble` | `FlyingMascot.tsx` | Bubble visibility, auto-pop 15-30s timer, click handler, bounce animation |
| `useRagChat` | `RagChat.tsx` | Chat messages state, SSE streaming, send/receive logic |
| `useDropdown` | `NavBar.tsx` | Dropdown open/close with 200ms hover delay |
| `useTimeline` | `page.tsx` | GSAP ScrollTrigger timeline build, resize handling, cloud/work spring physics |

---

## Data Fetching

**No React Query, SWR, or data-fetching library.** All data fetching uses plain `fetch()`.

API call pattern (`src/components/RagChat.tsx`):
```tsx
const response = await fetch("/api/rag/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ question, history }),
});
```

SSE streaming with ReadableStream:
```tsx
const reader = response.body?.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // parse "data: {...}" lines
}
```

Error handling with user-facing messages in state:
```tsx
try { /* fetch */ } catch {
  setMessages(prev => [...prev, { role: "assistant", content: "抱歉，出了点问题" }]);
}
```

Loading state: simple `useState(false)` boolean. No loading/error/data union types.

---

## Naming Conventions

- Custom hooks (if created): `use` prefix — `useMediaProgress`, `useMascotBubble`
- Return objects (not arrays) for multi-value hooks
- Place in a new `src/hooks/` directory if extracted

---

## Hook Patterns by Type

### useState
Used for all local UI state. No `useReducer` anywhere.
```tsx
const [open, setOpen] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
```

### useRef
Three uses: DOM refs, mutable non-render values, timer IDs.
```tsx
const inputRef = useRef<HTMLInputElement>(null);
const animatingRef = useRef(false);
const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

### useEffect
Common patterns: subscriptions with cleanup, auto-scroll, focus-with-delay, recursive setTimeout (preferred over setInterval).
```tsx
// Subscription with cleanup
useEffect(() => {
  return onMascotMessage((msg, force) => { /* ... */ });
}, []);

// Recursive setTimeout (not setInterval) for random-interval polling
useEffect(() => {
  let timeoutId: ReturnType<typeof setTimeout>;
  const scheduleNext = () => {
    timeoutId = setTimeout(() => { /* work */; scheduleNext(); }, 15000 + Math.random() * 15000);
  };
  scheduleNext();
  return () => clearTimeout(timeoutId);
}, []);
```

### useCallback
For event handlers that appear in dependency arrays or are passed to children:
```tsx
const sendMessage = useCallback(async (question: string) => { /* ... */ }, [messages, loading]);
```

### useMemo
Rare — only in `Beams.tsx` for Three.js material creation:
```tsx
const beamMaterial = useMemo(() => extendMaterial(THREE.MeshStandardMaterial, { /* ... */ }), [speed, noiseIntensity, scale]);
```

### useGSAP (from @gsap/react)
Used in `page.tsx` to scope GSAP animations to a container ref:
```tsx
useGSAP(() => { /* timeline setup */ }, { scope: masterRef });
```

---

## Anti-Patterns

- **No React Context** — `createContext`/`useContext` not used anywhere
- **No `useReducer`** — all state is `useState`
- **No `useMemo` for components** — no `React.memo` wrapping
- Cross-component communication uses module-level variables or pub/sub, not Context

---

## Common Mistakes

### setInterval 用于随机间隔轮询

**错误**: 使用 `setInterval` 做固定间隔轮询，无法实现随机间隔。
**正确**: 使用递归 `setTimeout`，在每次回调中随机计算下一次延迟。见 `FlyingMascot.tsx` 中的 auto-pop 实现。
