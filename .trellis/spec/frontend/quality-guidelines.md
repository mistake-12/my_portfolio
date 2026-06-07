# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

This project uses Next.js's built-in ESLint config. No Prettier, no Husky, no CI/CD pipeline. Testing is manual (browser verification). Quality relies on conventions enforced by code review patterns documented here.

---

## Toolchain

| Tool | Config | Notes |
|------|--------|-------|
| ESLint | `eslint-config-next` (v15.1.6) | Run via `npm run lint` (`next lint`) |
| TypeScript | `tsconfig.json` — `strict: true` | No separate `tsc` check in scripts |
| CSS | Tailwind CSS 3.4 | PostCSS + Autoprefixer |
| Testing | **None** | No Jest, Vitest, Playwright, or Cypress |
| CI/CD | **None** | No GitHub Actions, no Vercel checks |
| Pre-commit | **None** | No Husky, lint-staged |
| Formatting | **None (implicit)** | No Prettier config — relying on ESLint + editor defaults |

---

## Forbidden Patterns

### 1. Fixed 定位组件放在 GSAP ScrollTrigger pin 容器内

**永远不要**把 `position: fixed` 的浮层组件放在 `#stage4-hud` 或其他 GSAP pin 容器中。必须使用 `createPortal` 渲染到 `document.body`。详见 `component-guidelines.md` Common Mistakes 节。

### 2. 混用 `window.scrollTo` 和 Lenis

在 resize 恢复滚动位置或 `scrollToCategory` 导航时，必须先检查 `window.lenis` 是否存在：
```ts
const lenis = window.lenis;
if (lenis && typeof lenis.scrollTo === "function") {
  lenis.scrollTo(target, { immediate: true });
} else {
  window.scrollTo(0, target);
}
```

### 3. 用 `document.body.style.overflow = "hidden"` 阻止滚动

会与 GSAP ScrollTrigger 和 Lenis 产生冲突，导致滚动跳变。不要使用。

### 4. 在 `setTimeout` / `setInterval` 中忘记清理

所有定时器必须在 `useEffect` cleanup 中清理。当前代码库在 `FlyingMascot.tsx`、`NavBar.tsx`、`LoadingScreen.tsx`、`page.tsx` 中都正确实现了清理。

### 5. 静态数据中忘记 `featured: true`

`WorksProgress` 组件通过 `works.filter(w => w.featured)` 计算进度。如果新增作品不设置 `featured: true`，进度条会不准确。

---

## Required Patterns

### 1. 组件必须是 `"use client"`

所有组件文件必须以 `"use client"` 开头。项目重度依赖 GSAP/Three.js/Lenis，没有服务端组件。

### 2. 错误处理返回用户可见的消息

```ts
// API 层 (src/app/api/rag/chat/route.ts)
catch { return new Response(JSON.stringify({ error: "..." }), { status: 500 }); }

// 组件层 (src/components/RagChat.tsx)
catch { setMessages(prev => [...prev, { role: "assistant", content: "抱歉，出了点问题，请稍后再试。" }]); }
```

### 3. 图片/视频加载需有兜底

`LoadingScreen.tsx` 中：
- 跟踪 `<img>` 和 `<video>` 的加载状态
- 10 秒超时兜底
- MutationObserver 监听动态插入的媒体元素

### 4. SSR 安全：`typeof window` 检查或 `useEffect` 包裹

所有 DOM 操作（`document.querySelector`）、`window` 访问（Lenis）必须在 `useEffect` 或事件处理器中，不在 render 阶段直接执行。

### 5. 默认导出组件

```tsx
export default function ComponentName() { /* ... */ }
```

---

## Error Handling Patterns

### API Routes

```ts
// src/app/api/rag/chat/route.ts
try {
  // ...
} catch (error) {
  return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
}
```

### Client-Side Fetch

```ts
// src/components/RagChat.tsx
try {
  const response = await fetch("/api/rag/chat", { /* ... */ });
  if (!response.ok) {
    setMessages([...newMessages, { role: "assistant", content: "抱歉，出了点问题，请稍后再试。" }]);
    return;
  }
  // stream handling
} catch {
  setMessages(prev => {
    const updated = [...prev];
    updated.push({ role: "assistant", content: "抱歉，出了点问题，请稍后再试。" });
    return updated;
  });
}
```

### Null Guards for DOM Queries

GSAP 时间线在 `page.tsx` 中通过提前 return 处理所有 null DOM 查询：
```ts
if (!masterTrack || !scrollIndicator || !stage3 /* ... */) return;
```

---

## Performance Patterns

- **`willChange: "transform"`** — 用于高频变换的元素（`#master-track`、实线 SVG、吉祥物旋转层）
- **`gsap.quickSetter`** — 用于高频更新的 `x` 和 `rotate` 属性（实线平移、吉祥物旋转）
- **`dpr={[1, 2]}`** — Three.js Canvas 限制像素比
- **`frameloop="always"`** — Three.js 持续渲染（光束动画需要）
- **`invalidateOnRefresh: true`** — GSAP ScrollTrigger 在 resize 时自动重新计算
- **`scrub: 0.5`** — GSAP 时间线与滚动位置绑定，非帧驱动
- **CSS `transition`** — 用于云朵/作品卡片的惯性甩尾回弹，而非 JS animation frame
- **`overscrollBehavior: "contain"`** — 防止 RAG 消息列表触发页面橡皮筋滚动

---

## CSS / Styling

- **Tailwind 优先** — 静态样式用 className
- **Inline style 用于动态值** — 计算位置、JS 驱动的变换
- **`<style dangerouslySetInnerHTML>` 用于关键帧** — 组件局部的 `@keyframes`
- **`cn()` 合并类名** — `src/lib/utils.ts`

全局样式 (`src/app/globals.css`)：
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
/* + 自定义 CSS 变量和全局 @keyframes */
```

---

## Code Review Checklist

- [ ] 新组件是 `"use client"` 吗？
- [ ] Fixed 浮层用了 `createPortal` 吗？
- [ ] 定时器在 useEffect cleanup 中清理了吗？
- [ ] DOM 查询前有 null guard 吗？
- [ ] `document.body.style.overflow` 没有被修改吗？
- [ ] 新增 works 数据有 `featured: true` 吗？
- [ ] 错误处理有用户可见的反馈吗？
- [ ] `window.lenis` 使用前检查了吗？
- [ ] `@ts-ignore` 只在 Lenis 访问时使用吗？
