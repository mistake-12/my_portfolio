# Component Guidelines

> How components are built in this project.

---

## Overview

All components are React client components (`"use client"` directive). The project is animation-heavy with GSAP ScrollTrigger and Three.js, so server components are not used. Styling uses Tailwind CSS classes for static values and inline `style` objects for dynamic/computed values.

---

## Component Structure

Every component follows this pattern:

```tsx
"use client";

import { /* React hooks */ } from "react";
// other imports (gsap, three, local lib/data)

// Module-level variables for cross-instance communication (rare, see below)

interface ComponentNameProps {
  // props typed with interface, not type
  prop1: string;
  prop2?: number;
}

export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // hooks at the top
  // event handlers
  // conditional returns (e.g., if (!visible) return null)
  // JSX return
}
```

Real example from `src/components/WorkCanvas.tsx`:
```tsx
"use client";

import React from "react";
import { Work } from "@/data/works";
import WorkMedia from "./WorkMedia";
import WorkMeta from "./WorkMeta";

interface WorkCanvasProps {
  work: Work;
  index: number;
  className?: string;
}

export default function WorkCanvas({ work, index, className = "" }: WorkCanvasProps) {
  // ...
}
```

---

## Props Conventions

- **Always use `interface`**, never `type`, for props objects
- Props interface named `{ComponentName}Props` (e.g., `FlyingMascotProps`, `WorkCanvasProps`)
- Optional props use `?` modifier
- Destructure props in function signature with defaults where appropriate
- For components with many props, use object destructuring in the signature: `({ prop1, prop2 = "default" }: Props)`

Example from `src/components/FlyingMascot.tsx`:
```tsx
interface FlyingMascotProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

const FlyingMascot = forwardRef<HTMLDivElement, FlyingMascotProps>(
  ({ id, className = "", style }, ref) => {
    // ...
  },
);
```

---

## Export Style

- **Default export** for all components: `export default function ComponentName()`
- Module-scoped helper functions/components within the same file are NOT exported
- Cross-component communication uses module-level variables (not context):
  ```tsx
  // src/components/RagChat.tsx
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
    // ...
  }
  ```
- Pub/sub pattern for event-like communication:
  ```ts
  // src/lib/mascot-events.ts
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

---

## Styling Patterns

**Mixed approach: Tailwind + inline styles.**

- **Tailwind classes**: Used for static, responsive, and state-based styles (`className` prop)
- **Inline `style` objects**: Used for dynamic values (computed positions, GSAP-driven transforms, animation-dependent values)
- **No CSS modules, no styled-components, no Sass**
- Global CSS (`src/app/globals.css`) handles Tailwind directives and shared `@keyframes`

Typical pattern:
```tsx
<div
  className="relative z-10 flex h-screen w-max"
  style={{ willChange: "transform" }}
>
```

CSS animations defined inline within components using `<style dangerouslySetInnerHTML>`:
```tsx
<style
  dangerouslySetInnerHTML={{
    __html: `
      @keyframes mascot-float {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-8px); }
      }
    `,
  }}
/>
```

The `cn()` utility (`src/lib/utils.ts`) merges Tailwind classes:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## forwardRef Usage

Used when a component needs to expose a DOM ref to its parent:
```tsx
const FlyingMascot = forwardRef<HTMLDivElement, FlyingMascotProps>(
  ({ id, className = "", style }, ref) => {
    return <div ref={ref} id={id} ... />;
  },
);
FlyingMascot.displayName = "FlyingMascot";
```

**Always set `displayName`** after `forwardRef` components. This is the established pattern in this project (`FlyingMascot`, `MergedPlanes`, `PlaneNoise` in `Beams.tsx`).

---

## createPortal Pattern

Fixed overlay components that live inside GSAP ScrollTrigger pin containers use `createPortal` to render into `document.body`. This avoids `pointer-events` inheritance issues and GSAP layout conflicts.

```tsx
import { createPortal } from "react-dom";

if (!open) return null;
return createPortal(
  <>
    <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={close} />
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200 }}>
      {/* panel */}
    </div>
  </>,
  document.body,
);
```

This pattern is documented in the Common Mistakes section below.

---

## Accessibility

- Semantic HTML where practical: `<nav>`, `<main>`, `<button>`, `<input>`
- `aria-label` on icon-only buttons (e.g., `aria-label="关闭对话"`, `aria-label="发送"`)
- `title` attribute on the mascot: `title="右键打开对话"`
- No focus management beyond basic `inputRef.current?.focus()`
- No screen-reader-only text or ARIA live regions

---

## Common Mistakes

### Fixed 定位组件放在 GSAP ScrollTrigger 容器内导致布局异常

**症状**：打开 fixed 定位的弹窗/面板后，页面底部出现黑色区域，内容被挤压。交互方面：点击面板内的按钮无反应（X 关闭、发送按钮等）。

**根因**：`#stage4-hud` 容器有 `pointer-events-none` 且是 GSAP ScrollTrigger 的 pin 容器子元素。fixed 定位的子组件虽然脱离正常文档流，但仍然受父容器的 `pointer-events` 继承影响。此外，在 GSAP pin 容器内渲染 fixed 组件可能与 ScrollTrigger 的尺寸计算产生冲突，导致 `h-screen`（100vh）容器被挤压。

**错误做法**：
```tsx
// RagChat 直接渲染在 #stage4-hud 内
<div id="stage4-hud" className="pointer-events-none ...">
  <NavBar />
  <FlyingMascot />
  <RagChat />  {/* ← 这里 */}
</div>
```

**修复**：使用 `createPortal` 将 fixed 浮层组件渲染到 `document.body`，彻底脱离 GSAP 容器和 pointer-events 继承链：

```tsx
import { createPortal } from "react-dom";

if (!open) return null;
return createPortal(
  <>
    <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={close} />
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200 }}>
      {/* 面板内容 */}
    </div>
  </>,
  document.body,
);
```

**尝试过但不生效的修复**（记录避免重复踩坑）：
- 在组件上加 `pointerEvents: "auto"` — 不生效，仍被父容器拦截
- `document.body.style.overflow = "hidden"` — 与 GSAP ScrollTrigger / Lenis 冲突，导致滚动跳变
- `input.focus({ preventScroll: true })` — 缓解但不解决根本问题

### GSAP ScrollTrigger + Lenis 集成

项目使用 Lenis 平滑滚动，通过 `window.lenis` 全局变量访问。GSAP 时间线进度恢复在 resize 时需要调用 `lenis.scrollTo()` 而非 `window.scrollTo()`：

```ts
// @ts-ignore
const lenis = window.lenis;
if (lenis && typeof lenis.scrollTo === "function") {
  lenis.scrollTo(targetY, { immediate: true });
} else {
  window.scrollTo(0, targetY);
}
```

### DOM 选择器模式

组件通过 ID 选择器（`#stage1`, `#master-track` 等）而非 React refs 进行 GSAP 动画编排。这是因为 GSAP ScrollTrigger 需要直接访问 DOM 元素，而 pin 容器内部的组件引用方式更复杂。主时间线在 `page.tsx` 中通过 `document.querySelector` 收集所有 DOM 引用。
