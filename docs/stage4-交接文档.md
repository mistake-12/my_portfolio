# Stage 4 设计交接文档

## 概述

Stage 4 是作品集网站的核心展示区域，采用**横向滚动 + 曲线轨道 + 散点排版**方案。用户向下滚动时，页面固定在 Stage 4，内容向左平移，10 个作品卡片沿一条曲线轨道逐个展示。

Stage 4 由以下层次组成（从底到顶）：

```
z-index 层级结构
─────────────────
z-0    虚线轨道 SVG（内容层，跟随 master-track 平移）
z-[1]  云朵装饰层（沿轨道散布，有惯性甩尾）
z-[2]  实线轨道 clip（HUD 层，fixed 定位，不跟随平移）
z-[4]  作品卡片层（WorkCanvas × 10）
z-50   HUD 容器（实线 clip + 吉祥物）
z-[100] 飞行吉祥物（fixed 定位，跟随轨道旋转）
z-50   右下角进度器（fixed 定位）
```

---

## 一、轨道系统

### 1.1 路径生成

**核心文件**: `src/app/page.tsx`（第 96-155 行）
**路径模板**: 基于 `Vector64.svg`（3840×653，起点/终点 y=617.125）

**生成流程**:
1. 读取硬编码的 `baseD` 路径字符串（原始 SVG 的 d 属性）
2. 通过 `shiftVector64Y()` 将路径 Y 坐标平移到 `baselineY = window.innerHeight * 0.75`（即视口 75% 高度处）
3. 通过 `extendPath()` 将 3840px 宽的路径平铺拼接，直到覆盖 `horizontalDistance`（= 所有作品卡片总宽 - 1 屏幕宽）

**关键常量**:
| 常量 | 值 | 说明 |
|------|-----|------|
| `VECTOR64_WIDTH` | 3840 | 单段路径模板宽度 (px) |
| `VECTOR64_BASELINE_Y` | 617.125 | 模板原始 Y 坐标 |
| `baselineY` | `window.innerHeight * 0.75` | 路径在视口中的垂直位置 |

### 1.2 虚线轨道（内容层）

**位置**: `src/app/page.tsx` 第 547-559 行
**DOM ID**: `#guide-line-svg`（`<svg>`），内含 `#journey-path`（`<path>`）

| 属性 | 值 |
|------|-----|
| 定位 | `absolute`，跟随 `#stage4-wrapper`，随 `#master-track` 平移 |
| z-index | `z-0` |
| 颜色 | `#d4d4d8`（浅灰） |
| 线宽 | `1.5px` |
| 虚线样式 | `strokeDasharray="8 8"` |
| 尺寸 | JS 动态设置：width = stage4 总宽，height = stage4 总高 |
| 默认可见性 | `opacity: 0, visibility: visible`，由 GSAP 在 fly 阶段设为 `opacity: 1` |

### 1.3 实线轨道（HUD 层）

**位置**: `src/app/page.tsx` 第 578-604 行
**DOM ID**: `#solid-line-clip`（clip 容器），内含 `#solid-line-fixed-svg` > `#journey-path-fixed-fill`

| 属性 | 值 |
|------|-----|
| 定位 | `fixed`，不跟随 `#master-track` 平移 |
| z-index | `z-[2]` |
| 颜色 | `#FF4D00`（橙红强调色） |
| 线宽 | `1.5px` |
| 裁剪窗口 | `left: 0, width: 20vw`（只显示视口左侧 20% 宽度） |
| 同步方式 | 通过 `gsap.quickSetter` 设置 `translateX`，与 `#master-track` 平移量同步 |

**对齐公式**:
```
实线 screenX = solidX + contentX
虚线 screenX = wrapperOffset + contentX + trackX
对齐条件: solidX = wrapperOffset + trackX
```
其中 `wrapperOffset = window.innerWidth`，`trackX` 由 fly tween 驱动。

### 1.4 路径模板数据

`baseD` 硬编码在 `page.tsx` 第 101-102 行。这是一条波浪形路径，起点 `M0 617.125`，经过多次贝塞尔曲线到达终点 `L3840 617.125`。如需修改轨道形状：
- 修改 `baseD` 字符串（需要 `VECTOR64_BASELINE_Y` 保持一致）
- 或替换为新的 SVG 路径模板

---

## 二、作品卡片系统

### 2.1 数据模型

**文件**: `src/data/works.ts`

```typescript
interface Work {
  id: string;           // 唯一标识，生成 DOM id="work-{id}"
  title: string;        // 作品标题（橙色 #FF4D00）
  category: string;     // 分类
  description?: string; // 描述文本
  tags?: string[];      // 标签（最多显示 2 个）
  year: string;         // 年份
  layout: "img-left" | "img-right" | "stacked";  // 图文排列方式
  alignY: "start" | "center" | "end";             // 垂直对齐
  width: "w-[40vw]" | ... | "w-[85vw]";           // 卡片宽度
}
```

### 2.2 当前作品配置（10 个作品）

| ID | 宽度 | 布局 | 垂直对齐 | 说明 |
|----|------|------|----------|------|
| w1 | 85vw | img-right | start | 巨型画幅，靠上 |
| w2 | 55vw | img-left | end | 中等画幅，靠下 |
| w3 | 40vw | stacked | start | 紧凑画幅，靠上 |
| w4 | 70vw | img-right | end | 宽幅，靠下 |
| w5 | 60vw | img-left | start | 中等，靠上 |
| w6 | 45vw | stacked | end | 紧凑，靠下 |
| w7 | 75vw | img-right | start | 宽幅，靠上 |
| w8 | 55vw | img-left | end | 中等，靠下 |
| w9 | 40vw | stacked | start | 紧凑，靠上 |
| w10 | 80vw | img-right | end | 巨型，靠下 |

**排列原则**: `alignY` 严格交替 start/end，不使用 center。波峰段靠上、波谷段靠下，避开曲线轨道中间区域。

### 2.3 WorkCanvas 组件

**文件**: `src/components/WorkCanvas.tsx`

**宽度映射**:
| width class | max-width | 实际宽度 |
|-------------|-----------|----------|
| w-[40vw] | max-w-lg | 512px |
| w-[45vw] | max-w-xl | 576px |
| w-[55vw], w-[60vw] | max-w-3xl | 768px |
| w-[70vw], w-[75vw] | max-w-5xl | 1024px |
| w-[80vw], w-[85vw] | max-w-6xl | 1152px |

**垂直对齐映射**:
| alignY | CSS |
|--------|-----|
| start | items-start |
| center | items-center |
| end | items-end |

**布局映射**:
| layout | CSS |
|--------|-----|
| img-left | justify-start |
| img-right | justify-end |
| stacked | justify-center（单列 grid） |

每个卡片结构：
```
div#work-{id} (h-screen, flex-shrink-0)
  └─ div (flex, h-full, py-24, px-8~32)
       └─ div (grid, max-w-{size})
            ├─ WorkMedia（图片区域）
            └─ WorkMeta（文字区域）
```

### 2.4 WorkMeta 文字入场动画

**文件**: `src/components/WorkMeta.tsx`

**动画触发**: 由 `page.tsx` 中 `updateWorkVisibility()` 控制。当卡片进入视口（`rect.right > 100 && rect.left < window.innerWidth - 100`），延迟 100ms 后添加 `.is-visible` class。

**CSS 动画参数**:
| 元素 | class | 初始状态 | 结束状态 | transition | 延迟 |
|------|-------|----------|----------|------------|------|
| 序号/标签/描述/底部 | `.reveal-item` | opacity:0, translateY(24px) | opacity:1, translateY(0) | 1.0s ease | 100ms/260ms/340ms |
| 标题 | `.reveal-title` | opacity:0, translateY(32px) | opacity:1, translateY(0) | 1.2s ease | 180ms |
| View Project 按钮 | `.view-link` | opacity:0, scale(0) | opacity:1, scale(1) | 1.0s spring | 跟随底部 |

**特点**: 一次性的（`revealed: false` 标志），向前滚动触发后不反转。

**标题颜色**: `#FF4D00`（text-[#FF4D00]）

### 2.5 卡片惯性甩尾

每个作品卡片在横向滚动时会产生惯性偏移，模拟物理滞后感。

**参数**（`page.tsx` 第 202-245 行、第 437-445 行）:
| 参数 | 值 | 说明 |
|------|-----|------|
| 速度系数 | `* 150` | 独立于云朵的速度感度 |
| 偏移量系数 | `* 125` | |
| 偏移上限 | `[-40, 40]` px | |
| weight | `widthVw / 60` | 范围 0.67 ~ 1.42，宽卡片惯性更大 |
| CSS transition | `0.6 + weight * 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)` | 弹簧曲线回弹 |

---

## 三、云朵装饰系统

### 3.1 组件结构

**文件**: `src/components/Clouds.tsx`

使用 `forwardRef` + `useState([])`/`useEffect` 确保 SSR 安全（`Math.random()` 只在客户端运行）。

### 3.2 云朵生成逻辑

`generateClouds()` 函数为每个作品区域生成云朵：
- 每区域数量：`i % 3 === 0 ? 2 : 1`（当前约 12-15 朵）
- 分布：一部分在轨道线上方（top 10%-55%），一部分在下方（top 85%-95%）
- 水平位置：在对应作品区域的宽度范围内随机分布

单个云朵属性：
| 属性 | 值 | 说明 |
|------|-----|------|
| scale | 0.5 ~ 1.7 | 大小缩放，也作为惯性 weight |
| opacity | 0.08 ~ 0.20 | 半透明 |
| duration | 25 ~ 60s | CSS 漂移动画周期 |
| delay | 0 ~ -30s | 动画延迟（负值使动画立刻从中间开始） |
| driftX | 15 ~ 55px | 漂移水平范围 |

### 3.3 SVG 形状

使用内联 `<symbol id="cloud-shape">` + `<use href="#cloud-shape">` 复用：

```
viewBox="0 0 150 90"
├─ rect x=0 y=40 150×50 rx=25 ry=25  (下部圆角矩形)
├─ circle cx=60 cy=35 r=35           (左侧凸起)
└─ circle cx=102 cy=42 r=27          (右侧凸起)
```

所有形状填充为 `#FFFFFF`。

### 3.4 视觉参数

| 属性 | 值 |
|------|-----|
| 颜色 | `#FFFFFF`（纯白，不透明度 100%） |
| 阴影 | `filter: drop-shadow(0 8px 8px rgba(0,0,0,0.2))` |
| 可见性控制 | 初始 `visibility: hidden`，GSAP 在 fly 阶段设 `visibility: visible; opacity: 1` |

### 3.5 云朵惯性甩尾

**参数**（`page.tsx` 第 412-434 行）:
| 参数 | 值 | 说明 |
|------|-----|------|
| 速度系数 | `* 200` | 帧间进度差放大系数 |
| 偏移量系数 | `* 300` | |
| 偏移上限 | `[-80, 80]` px | |
| weight | cloud.scale（0.5 ~ 1.7） | 大云朵惯性更大 |
| CSS transition | `0.6 + scale * 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)` | 弹簧曲线回弹 |

**工作原理**:
1. 每帧计算 `velocity = (当前进度 - 上一帧进度) * 200`
2. 每朵云的目标偏移：`offset = clamp(velocity * weight * 300, -80, 80)`
3. 直接设置 `element.style.transform = translateX(offset)` 
4. CSS transition 自动处理平滑和回弹（GSAP 设完值后，下一帧 velocity 归零时自动弹回）

### 3.6 注意：prefers-reduced-motion

`src/app/globals.css` 中有针对无障碍的适配：
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 300ms !important; /* 允许基本过渡 */
  }
}
```

如果用户系统开启了"减少动态效果"，云朵漂移动画会被禁用，但过渡（弹簧回弹）仍保留 300ms。

---

## 四、飞行吉祥物

**文件**: `src/components/FlyingMascot.tsx`

| 属性 | 值 |
|------|-----|
| 定位 | `fixed`，left: 20vw, top: 75vh, translate(-50%, -50%) |
| z-index | `z-[100]` |
| 旋转 | 由 `page.tsx` onUpdate 驱动 `.js-mascot-rotation` 元素 |
| 旋转范围 | `[-15°, 15°]`，由 `velocity * 30` 计算，带 0.12 平滑 |
| 浮动动画 | `@keyframes mascot-float`，上下 8px，3s 周期 |
| 眨眼动画 | `@keyframes mascot-blink`，5s 周期 |

---

## 五、GSAP 时间线

**文件**: `src/app/page.tsx`（第 265-457 行）

### 5.1 滚动触发配置

```javascript
scrollTrigger: {
  trigger: "#master-pin-container",
  start: "top top",
  end: `+=${totalScrollDistance}%`,  // 400vh + 横向滚动距离
  pin: true,
  scrub: 0.5,
}
```

### 5.2 时间线阶段

```
Stage 1 (Welcome) → 3D 模糊淡出
    ↓
Stage 2 (About) → 交叉淡入
    ↓
Stage 3 (Disciplines) → 3D 翻转出现
    ↓
【reveal 阶段】master-track 平移 0 → -20vw，实线跟随
    ↓
【fly 阶段】master-track 平移 -20vw → 终点
    同时：虚线出现、实线出现、吉祥物出现、云朵出现
    每帧：实线同步、吉祥物旋转、云朵甩尾、卡片甩尾、文字入场检测
    ↓
fly 结束后：吉祥物 + 实线 + 云朵隐藏
```

### 5.3 关键计算

```
totalScrollDistance = 400 + (horizontalDistance / innerWidth) * 100
  - 400 是 3D 剧场的 400vh
  - 后半部分是 Stage 4 横向滚动的 vh 等价

horizontalDistance = masterTrack.scrollWidth - window.innerWidth
  - masterTrack 是所有胶片格的总宽

flyDistancePx = horizontalDistance - innerWidth * 0.2
  - 减去前 20vw 的 reveal 阶段

dur = flyDistancePx / window.innerWidth
  - fly 阶段的 duration（GSAP time-based）
```

### 5.4 同帧回调优先级

每帧 onUpdate 中的执行顺序：
1. 实线同步 `setSolidX()`
2. 帧间速度计算 `velocity` 和 `cardVelocity`
3. 吉祥物旋转
4. `ensureCloudsReady()` → 云朵惯性偏移
5. `ensureWorkCardsReady()` → 卡片惯性偏移
6. `updateWorkVisibility()` → 文字入场检测

---

## 六、进度指示器

**文件**: `src/components/ui/WorksProgress.tsx`

| 属性 | 值 |
|------|-----|
| 定位 | `fixed`，右下角（bottom-8, right-8） |
| 显示时机 | 仅在 Stage 4 横向滚动阶段 |
| 数字 | 0-100%，等宽字体 |
| 进度条 | 白色，1px 高，16px 宽 |
| 混合模式 | `mix-blend-difference`（反色适应背景） |

---

## 七、快速调参指南

### 轨道
| 参数 | 位置 | 当前值 |
|------|------|--------|
| 虚线颜色 | page.tsx:555 | `#d4d4d8` |
| 虚线线宽 | page.tsx:556 | `1.5` |
| 虚线 dash | page.tsx:557 | `"8 8"` |
| 实线颜色 | page.tsx:597 | `#FF4D00` |
| 实线线宽 | page.tsx:598 | `1.5` |
| 实线裁剪宽度 | page.tsx:587 | `"20vw"` |
| 轨道 Y 位置 | page.tsx:94 | `innerHeight * 0.75` |

### 云朵
| 参数 | 位置 | 当前值 |
|------|------|--------|
| 速度系数 | page.tsx:412 | `* 200` |
| 偏移量系数 | page.tsx:432 | `* 300` |
| 偏移上限 | page.tsx:432 | `[-80, 80]` |
| 阴影 | Clouds.tsx:116 | `drop-shadow(0 8px 8px rgba(0,0,0,0.2))` |
| 过渡时长 | Clouds.tsx:108 | `0.6 + scale * 0.6s` |
| 每区域云朵数 | Clouds.tsx:45 | `i % 3 === 0 ? 2 : 1` |

### 卡片甩尾
| 参数 | 位置 | 当前值 |
|------|------|--------|
| 速度系数 | page.tsx:413 | `* 150` |
| 偏移量系数 | page.tsx:442 | `* 125` |
| 偏移上限 | page.tsx:442 | `[-40, 40]` |

### 文字入场
| 参数 | 位置 | 当前值 |
|------|------|--------|
| 入场延迟 | page.tsx:260 | `100ms` |
| 视口触发阈值 | page.tsx:252 | `rect.right > 100 && rect.left < innerWidth - 100` |
| 标题颜色 | WorkMeta.tsx:41 | `#FF4D00` |

### 其他
| 参数 | 位置 | 当前值 |
|------|------|--------|
| Stage 4 背景色 | page.tsx:544 | `#FDF8ED` |
| 吉祥物旋转范围 | page.tsx:418 | `[-15°, 15°]` |
| 吉祥物旋转平滑 | page.tsx:419 | `* 0.12` |
| scrub 平滑度 | page.tsx:271 | `0.5` |

---

## 八、文件索引

| 文件 | 职责 |
|------|------|
| `src/app/page.tsx` | 主时间线、轨道生成、惯性甩尾、文字入场检测 |
| `src/app/globals.css` | 全局 CSS 变量、字体、prefers-reduced-motion |
| `src/data/works.ts` | 作品数据模型与配置 |
| `src/components/WorkCanvas.tsx` | 作品卡片容器（布局/对齐/宽度映射） |
| `src/components/WorkMeta.tsx` | 作品文字内容 + 入场动画 CSS |
| `src/components/WorkMedia.tsx` | 作品图片区域 |
| `src/components/Clouds.tsx` | 云朵装饰组件（生成/渲染/动画） |
| `src/components/FlyingMascot.tsx` | 飞行吉祥物 |
| `src/components/ui/WorksProgress.tsx` | 右下角进度指示器 |
| `src/lib/extendPath.ts` | SVG 路径平铺拼接工具 |
| `public/cloud.svg` | 云朵 SVG 参考文件（运行时使用内联 symbol） |
