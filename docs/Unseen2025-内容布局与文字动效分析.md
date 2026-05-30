# Unseen 2025 内容布局与文字揭示动效 — 技术分析文档

> 源码来源：https://2025.unseen.co/ (HTML + CSS + JS)
> 文档目的：为 profile_website Stage 4 作品展示区提供技术参考，暂不开发。

---

## 一、整体页面结构

### 1.1 顶层布局

```
<body>
  <header class="header" />
  
  <main class="scroll-container | js-scroll-container">
    <!-- 故事线 SVG（position:fixed → HUD 层） -->
    <svg class="story__line | js-line"              ← 虚线（32000×300，跟随滚动）
    <div class="story__line-clip | js-line:altContainer">  ← 实线 clip 容器（fixed）
      <div class="story__line__overflow overflow-hidden">
        <svg class="story__line story__line--solid | js-line:alt">  ← 实线（translateX 驱动）
    
    <!-- 气球（position:fixed → HUD 层） -->
    <div class="story__balloon | js-balloon">
    
    <!-- 故事内容层（flex row，width: max-content，横向排列） -->
    <div class="story-holder">
      <section class="story">   ← 第一屏intro（章节封面）
      <section class="story">   ← 内容段落 1
      <section class="story">   ← 内容段落 2
      ...
    </div>
    
    <!-- 章节导航（fixed） -->
    <div class="chapter-selector" />
  </main>
</body>
```

### 1.2 关键发现：每个 `<section class="story">` 是一个独立的"屏幕单元"

- 在 `@horizontal` (触摸+鼠标桌面，≥1024px) 下：`display: flex; width: max-content; height: 100vh; overflow: hidden`
- 每个 story section 内可包含多个子 section（`story__text-illus`, `story__central-text`, `story__image-caption` 等）
- 这些子 section 在横屏模式下的宽度是 `auto` / `max-content`，内容决定宽度，而非固定 `100vw`

---

## 二、Section 类型体系（6 大类）

Unseen 使用了一组可组合的 section 类型，每个都有特定的 CSS 类名前缀和响应式行为。

### 2.1 `story__text-illus` — 文字+插图并排

```
结构：
<div class="story__section d-flex story__text-illus flex-column-reverse flex-column@horizontal js-section">
  
  <!-- 年份装饰（绝对定位，带 parallax） -->
  <div class="story__text-illus__year">
    <span class="story__year__thicc">2024</span>   ← 巨大半透明年份水印
  
  <!-- 图片容器（带 data-parallax 属性） -->
  <div class="story__text-illus__img-container d-flex items-center" 
       data-parallax="0.9" data-parallax-range="full">
    <img src="..." />
  
  <!-- 文字区域（带 SplitText 揭示动画） -->
  <div class="story__text-illus__text">
    <h2>标题文字</h2>
    <p>描述段落...</p>
    <div class="story__text-illus__button">
      <button class="btn">View Project</button>
```

**CSS 关键规则：**
- 方向：`flex-column-reverse` (移动端：文字在上，图在下) → `flex-column@horizontal` (桌面端：上下堆叠)
- 图片容器在 `@horizontal` 下：`margin-left: 43.25rem; max-width: 53.3125rem; z-index: 14`
- 文字宽度：`38.125rem` (约 610px)
- 图片 `max-height: 63vh`

### 2.2 `story__central-text` — 居中大字（核心信息段落）

```
结构：
<div class="story__section d-flex items-center story__central-text js-central-text">
  <div class="story__central-text__text">
    <p>一大段居中排版的叙述性文字...</p>
    <div class="story__central-text__button">
      <button class="btn">...</button>
```

**CSS 关键规则：**
- 文字宽度：`39.375rem` (约 630px)
- z-index: 16 (桌面)
- 按钮位置：`bottom: calc(100% + 2.5rem)` — 悬在文字上方

### 2.3 `story__image-caption` — 全宽图片+图注

```
结构：
<div class="story__section d-flex items-center story__image-caption">
  <video class="story__image-caption__img" playsinline autoplay muted loop>
  <img data-parallax="0.9" data-parallax-range="full">
  <figcaption>...</figcaption>
```

**CSS 关键规则：**
- 图片最大宽度：`53.3125rem`；`object-fit: cover`
- `data-parallax` 元素 z-index: 14

### 2.4 `story__year-text` — 年份+大段文字

```
结构：
<div class="story__section d-flex flex-column-reverse flex-column@horizontal justify-between story__year-text js-section">
  <div class="story__year-text__text">
    <p>文字内容...</p>
  <span class="story__year__thicc">2024</span>  ← 年份水印
```

**CSS 关键规则：**
- 文字宽度：`37.5rem`；带 `margin-left: 10.9375rem`
- 年份水印：`font-size: 18.75rem; letter-spacing: .01em; color: var(--thicc, #B8B8B8); z-index: -1`

### 2.5 `story__full-image` — 满屏图片（溢出效果）

```
结构：
<div class="story__section story__full-image">
  <div class="story__full-image__img-container">
    <img>
```

**CSS 关键规则：**
- 图片容器：`height: 100vh; overflow: hidden`
- 图片本身：`width: 140%; max-width: 140%; height: 100%; margin-left: -40%`
- 此举制造了"图片超宽、从左侧溢出"的视觉张力

### 2.6 `story__colored` — 彩色背景+多图散点

```
结构：
<div class="story__section story__colored">
  <div class="story__colored__text">...</div>
  <div class="story__colored__images">
    <div>
      <img class="story__colored__image--1">
      <img class="story__colored__image--2">
    </div>
    <div>
      <img class="story__colored__image--3">
      <img class="story__colored__image--4">
    </div>
```

**CSS 关键规则：**
- Section 宽度：`248.75rem` (极宽，容纳多张散点图)
- 每张图片用 `position: absolute` 定位在不同坐标：
  - `--1: top: -4.625rem; left: 20.1875rem`
  - `--2: top: -7.5rem; left: 55.5625rem`
  - `--3: top: calc(100% + 10.625rem); right: 49rem`
  - `--4: top: -4.625rem; right: 9.5625rem`

### 2.7 其他 Section 类型

| 类名 | 用途 | 桌面端文字宽度 |
|---|---|---|
| `story__large-central-text` | 超大居中文字 | `66.5625rem` |
| `story__year-illus` | 年份水印+插图 | — |
| `story__year-text-3` | 三栏年份文字 | `36.6875rem` |
| `story__text-btm` | 文字靠底 | `36.6875rem` |
| `story__end` | 章节结尾页 | `100vw` 全屏 |

---

## 三、响应式断点系统

### 3.1 `@horizontal` — Unseen 的核心创新

```css
/* 只在高精度输入设备 + 宽屏时激活横滚模式 */
@media (hover: hover) and (pointer: fine) and (min-width: 1024px) {
  .has-horizontal-scroll { ... }
}

/* 相应的 CSS 变量 */
--bp-horizontal: (hover: hover) and (pointer: fine) and (min-width: 1024px);
```

这个断点将设备分为两类：
- **横滚模式**：鼠标+桌面，≥1024px → 启用 `story__line`、`story__balloon`、横向 layout
- **竖滚降级**：触摸设备，或屏幕<1024px → 全部降级为普通纵向滚动，不显示轨道线和气球

### 3.2 移动端布局策略

`flex-column-reverse` 是移动端默认 → 文字在上方先读，图片在下方辅助。桌面端通过 `flex-column@horizontal` 还原为上下堆叠。

**关键模式：**
```css
/* 移动端默认：flex-column-reverse（文字→图片） */
.story__text-illus { flex-direction: column-reverse; }

/* 桌面端：flex-column（图片→文字，上层结构是横向排列） */
@media (--bp-horizontal) {
  .story__text-illus { flex-direction: column; }
}
```

---

## 四、文字揭示动画系统（SplitText + GSAP）

### 4.1 核心机制

Unseen 使用 GSAP **SplitText** 插件将段落拆分为 `<div>` 行（lines 模式），然后每行附着一个 ScrollTrigger 驱动的入场动画。

**不用 `.chars` / `.words`，只用 `.lines`** —— 因为行级动画在视觉上足够细腻，且性能远好于逐字动画。

### 4.2 动画参数

从 JS 源码中提取的关键参数：

| 参数 | 值 | 含义 |
|---|---|---|
| **SplitText type** | `"lines"` | 按行拆分 |
| **初始状态** | `rotateX: -15`, `xPercent: 25`, `z: -100`, `opacity: 0` | 文字从"被压入页面深处"的视角开始 |
| **结束状态** | `rotateX: 0`, `xPercent: 0`, `z: 0`, `opacity: 1` | 文字"翻转到平面上" |
| **stagger** | `0.1` | 每行间隔 0.1 秒 |
| **duration** | `1.2` | 单行动画持续 1.2 秒 |
| **ease** | `"joe.out"` 或类似自定义缓动 | 柔和的减速曲线 |
| **ScrollTrigger start** | `"left right-=20%"` | 元素左侧边缘进入视口右侧 20% 处触发 |

### 4.3 两个核心 JS 类

#### Class A — `cN` (`.js-section` 处理器)

- 选中页面上所有 `.js-section` 元素
- 对每个 section 内的文字元素执行 SplitText `{type: "lines"}`
- 创建 ScrollTrigger 绑定到 section 的水平位置
- 动画：`rotateX(-15) + xPercent(25) + z(-100) + opacity(0)` → 归零

#### Class B — `uN` (`.js-central-text` 处理器)

- 选中页面上所有 `.js-central-text` 元素
- 逻辑与 `cN` 基本相同，但针对居中文字做了细节调整
- 相同的 SplitText + ScrollTrigger 管线

### 4.4 按钮动画

按钮使用 CSS transform 缩放进入：

```css
.btn {
  --reveal: .8s;
  transform: translateZ(0) scale(0);         /* 初始隐藏：缩小到 0 */
  transition: transform var(--reveal) cubic-bezier(.25,1,.5,1), 
              opacity .3s cubic-bezier(.76,0,.24,1);
}

.btn.is-visible {
  transform: translateZ(0) scale(1);         /* 出现：缩放到 1 */
}

.btn:hover {
  transform: scale(1.1);                     /* Hover：微微放大 */
}
```

`is-visible` 类名由 ScrollTrigger 在元素进入视口时添加。

---

## 五、Parallax 视差系统

### 5.1 标记方式

```html
<img data-parallax="0.9" data-parallax-range="full">
```

- `data-parallax`: 视差强度系数（0~1）。`0.9` = 移动 10% 速度（与滚动反向）
- `data-parallax-range`: 触发范围。`"full"` = section 整个生命周期内持续视差

### 5.2 计算逻辑

从 JS 中提取（`lN` 类）：
```
parallaxX = (1 - parallaxValue) × windowWidth
```

即：`data-parallax="0.9"` 的元素在滚动过程中横向移动 `(1-0.9) × windowWidth = 0.1 × vw` 的距离。

### 5.3 与轨道线的关系

Parallax 元素 (`z-index: 14`) 在 DOM 层级上位于虚线轨道 (`z-index: 11`) 和实线 clip (`z-index: 11`) 之上，因此图片和文字内容遮盖了轨道线——形成"轨道线在内容背后穿过"的景深感。

---

## 六、Z-Index 层级体系

Unseen 用一个精心设计的 z-index 系统来管理景深：

| z-index | 元素 | 说明 |
|---|---|---|
| `-1` | `story__year__thicc` | 年份水印在文字之下 |
| `0` | — | 基线 |
| `1` | 各种内容 | 常规内容 |
| `10` | `.story__central-text` | 居中文字 |
| `11` | `.story__line`, `.story__line-clip` | **轨道线**（虚+实都在此层） |
| `12` | `.story__line-dot` | 轨道节点圆点 |
| `13` | `.story__full-image__img-container`, `.tooltip-toggle` | 满屏图片、tooltip |
| `14` | `.story__balloon`, `[data-parallax]`, 插图 | **气球 + 视差元素**（比线高） |
| `15` | `.story__intro`, `.story__end` | 章节首尾框架 |
| `16` | `.story__central-text` (桌面), `.story__year` | 年份装饰 |
| `17` | `.story__year-text-3__text` | 三栏文字 |
| `18` | `.story__text-illus__text` | 文字区最前 |
| `20` | `.chapter-info-toggle` | 章节信息按钮 |
| `999` | `.unseen-scrollbar` | 自定义滚动条 |

**核心发现：轨道线(z-11) < 内容图片/文字(z-14~18)，轨道在内容"下方穿过"。**

---

## 七、轨道线与内容的视觉关系

### 7.1 空间关系

```
视觉前层 (z-14~18)
  │  作品图片、文字、插画
  │  ┌─────────────────────────────────────────────┐
  │  │  Work Canvas 1  │  Work Canvas 2  │  WC 3  │
  │  └─────────────────────────────────────────────┘
  │       ▲ 内容遮盖轨道线
  └───── 轨道线 (z-11) ────────────────
    ═══════════════════════════════════════════════
    │  虚线（内容层）    实线（HUD 层 clip）
    
视觉底层 (z-0)
  │  背景
```

### 7.2 轨道线的高度参数

- SVG 尺寸：`32000×300`（宽 32000px，高 300px）
- 虚线位置：`top: -18vh`（在内容顶部上方）
- 实线位置：`top: -18vh`（同虚线，确保重叠）
- 实线水平起点：`left: calc(100% - 34.264375rem)`（从右边缘偏移约 550px）
- Clip 窗口：`position: fixed; top: 0; left: calc(-137.05625rem + 34.264375rem); width: 137.05625rem`

### 7.3 为什么轨道线"总在气球脚下"

气球 `position: fixed; left: 31.25rem; top: 60%`，而轨道线的 Y 范围（viewBox 高 300 + CSS `top: -18vh`）在 ±150px 内波动，始终在气球 60vh 位置附近——这是故意设计的视觉对齐。

---

## 八、字体系统

Unseen 使用了 7 种字体，各司其职：

| 字体 | 用途 | 特征 |
|---|---|---|
| **Neue Montreal** | UI / 标签 / 按钮 | 中性无衬线，清晰可读 |
| **New Icon Serif** | 标题 / 年份数字 | 优雅衬线，文化感 |
| **New Icon Script** | 年份首字母装饰 | 手写体，增加温度 |
| **Bootzy Condensed TM** | 超大装饰年份水印 | 极粗压缩衬线，视觉冲击 |
| **DM Mono** | 眉题 / 年月标签 | 等宽无衬线，工业感 |
| **FreightText** | 正文段落 | 经典衬线正文字体 |
| **系统字体** | 降级 | sans-serif, serif |

**字体大小流体计算：**
```css
font-size: calc(min(max(12px, .8333333334vw), 20px) * 1)
```
确保字体在 12px ~ 20px 之间，随视口线性缩放。

---

## 九、关键数值与规则

### 9.1 宽度系统

Unseen 使用基于 `rem` 的精确宽度控制（设计稿基准 16px）：

| 元素 | 宽度 | 约等于 px |
|---|---|---|
| `story__text-illus__text` | `38.125rem` | 610px |
| `story__central-text__text` | `39.375rem` | 630px |
| `story__year-text__text` | `37.5rem` | 600px |
| `story__large-central-text__text` | `66.5625rem` | 1065px |
| 图片最大宽度 | `53.3125rem` | 853px |
| 实线 clip 窗口 | `137.05625rem` | 2193px |

### 9.2 间距系统

Unseen 使用 Tailwind 式的原子间距类，以 `0.0625rem` (1px) 为单位：

- `mt-16` = 1rem, `mt-24` = 1.5rem, `mt-32` = 2rem, `mt-48` = 3rem, `mt-64` = 4rem
- section padding: `4rem 1rem`（移动端） → `5rem 10rem`（桌面端）

### 9.3 气球参数

| 参数 | 值 |
|---|---|
| 定位 | `position: fixed` |
| X | `left: 31.25rem` (≈20vw @ 2560px) |
| Y | `top: 60%` |
| 尺寸 | `143px × 92px` |
| Sprite Sheet | `858px × 552px` (6×6 帧，animation: eyes 3s steps(1)) |
| Z-index | `14` |

---

## 十、对我们项目的启示

### 10.1 与现有实现的差异

| 维度 | 我们的实现 | Unseen 2025 |
|---|---|---|
| 内容布局 | WorkCanvas 100vw 固定宽度 | 内容宽度可变，max-content |
| 文字动画 | ❌ 未实现 | SplitText lines + ScrollTrigger |
| 布局策略 | 每个作品=一个全宽画布 | 每个 section=内容驱动的自然宽度 |
| 年份装饰 | 无 | 巨大渐隐年份水印 |
| 按钮动画 | 无 | CSS scale(0)→scale(1) |
| Parallax | 无 | data-parallax + ScrollTrigger 驱动 |
| 轨道z-index | 轨道在内容下方 | 轨道在内容下方 (z-11 vs z-14~18) |

### 10.2 可直接借鉴的技术

1. **SplitText 行级动画**：用 `gsap.fromTo()` + ScrollTrigger 实现文字"从页面深处翻出"的效果
2. **Section 类型体系**：定义 3-5 种 WorkCanvas 内部布局模板，而非单一画布模式
3. **`@horizontal` 断点**：将横滚模式限制在 `(hover:hover) and (pointer:fine) and (min-width:1024px)`
4. **Z-index 层级**：轨道线 z-11，内容图片 z-14，文字 z-16~18，让轨道在内容"后方穿过"
5. **按钮入场动画**：`scale(0)` → `scale(1)`，比 opacity 过渡更有质感
6. **年份水印**：超大字号 + 极低透明度 + z-index:-1，增加视觉层次
7. **Parallax 标记**：`data-parallax="0.9"` 简化声明式视差，ScrollTrigger 统一驱动

### 10.3 需要适配的差异

- Unseen 是一个**单页叙事**（每条故事线讲述一个品牌案例），我们的项目是**多作品集合展示**
- Unseen 的 section 宽度由内容驱动（文字量不固定），我们的 WorkCanvas 宽度更规整
- Unseen 的内容排版是**图文混排（杂志式）**，我们的作品展示可能更偏向**视觉主导**

### 10.4 推荐的最小实现路径

如果后续要进行开发，建议按以下优先级：

1. **先做文字揭示动画** — 这是提升质感的最高性价比改动
2. **再做按钮入场动画** — 简单 CSS transform，效果立竿见影
3. **再做 section 类型变化** — 在现有 3 种 layout 基础上微调
4. **最后做 parallax** — 锦上添花，但复杂度高

---

## 十一、附录：CSS 自定义属性（设计令牌）

```css
:root {
  --white: #fff;
  --black: #000;
  --text: #332F22;
  --main-bg: #0A0901;
  --site-background: #E2E2E2;
  --yellow: #9D6E46;                /* 主色调：温暖的古铜金 */
  --yellow-light: #E8B900;          /* 亮金：箭头/强调 */
  --story-intro: #E2E2E2;           /* 故事章节封面文字 */
  --story-colored-light: #B7B09C;   /* 浅色故事背景 */
  --story-colored-dark: #090A02;    /* 深色故事背景 */
  --vintage-text: #E2E2E2;          /* 深色背景上的文字 */
  --vintage-highlight: #9D6E46;     /* 高亮：链接/数字 */
  --vintage-line-main: #9D6E46;     /* 虚线主色 */
  --grey: #ABABAB;
  --grey-dark: #5E5E5E;
}
```

---

*文档生成于 2026-05-28，基于 https://2025.unseen.co/ 线上源码分析。*
*所有 CSS 数值、动画参数均为实测提取。*
