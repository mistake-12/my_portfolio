# Stage 4 (Works Section) — 技术设计文档

> 目标：构建模块化、可无缝拓展的横向卷轴作品展示系统，参考 unseen.co 交互风格。
>
> **文档版本：v3.0** | 核心更新：吉祥物固定不动 / 曲线改为狂野有机形态 / 视错觉机制重构

---

## 一、核心设计理念

### 1.1 问题定义

传统作品集网站的网格布局（Grid）是**二维静态**的——所有作品同时可见，用户以"浏览货架"的方式消费内容。

unseen.co 采用的**横向卷轴**是**一维流动**的——用户一次只能聚焦一个作品，被迫以"消费杂志"的方式沉浸式阅读。

### 1.2 视觉语言核心：视错觉（Optical Illusion）

参考 unseen.co 的视觉核心是**视错觉**，而非吉祥物跟随曲线飞行：

- **吉祥物（Flying Pony）：** 固定在视口内的某个位置（`position: fixed`），完全静止，不跟随任何路径移动
- **曲线：** 狂野、有机、随机的贝塞尔形态，视觉上呈现出无规律的起伏，不是数学上规整的波形
- **视错觉原理：** 当横向轨道向左滚动时，狂野曲线作为背景层随之平移，而吉祥物固定不动——两者产生**相对位移**，给用户造成"吉祥物在曲线间穿梭飞行"的强烈视错觉

> 这比吉祥物真实跟随曲线飞行的方案在视觉上**更有冲击力**：真实跟随是物理运动，视错觉是心理学感知。前者正确但"对"，后者错误但"震撼"。

### 1.3 设计目标

| 维度 | 目标 |
|------|------|
| **动线** | 竖向滚动 → 触发横向平移（Horizontal Scroll-jacking） |
| **单画布标准** | 每块作品画布宽度 = 1×视口宽度 (100vw)，可无线拼接 |
| **全局唯一曲线** | 一条狂野生曲线贯穿所有画布，作为视错觉的背景层 |
| **吉祥物固定** | 吉祥物 `position: fixed`，完全不随曲线运动，静止制造对比 |
| **弹性安全区** | 内部内容有 max-width 上限，适配超宽屏 |
| **数据驱动** | 仅维护 `works.ts` 数据数组，UI 自动生成 |
| **相位演进** | MVP → 狂野曲线 → 吉祥物固定视错觉 → 终极打磨（4 Phase） |

---

## 二、已知技术陷阱与解决方案

| # | 陷阱 | 原因 | 解决方案 |
|---|------|------|---------|
| T1 | **多 Path 拼接断裂** | 多个独立 `<path>` 标签在画布边界处视觉断裂 | 改为**单一全局曲线**，一根 path 贯穿所有画布 |
| T2 | **超宽屏排版失控** | 34" 带鱼屏 / 4K 下 100vw 内容无限放大 | 外层 100vw 保持滚动计算，内部 `max-w-7xl` 安全区约束 |
| T3 | **吉祥物跟随导致机械感** | 吉祥物真实沿路径飞行，动作精确但缺乏"有机感" | 吉祥物**完全固定**，靠背景曲线滚动制造视错觉 |
| T4 | **规整曲线缺乏灵气** | 纯数学波形（正弦/余弦）过于机械刻板 | **狂野有机曲线**：手动控制点 + 随机偏移，呈现手工感 |

---

## 三、架构设计

### 3.1 整体页面结构

```
<body>
  <MainScrollWrapper />          ← 已有，pinned H1–H3，end +=400%
       ├── #stage1 (Welcome)
       ├── #stage2 (About)
       └── #stage3 (Discipline)

  <WorksSection />              ← 新增，Stage 4，pinned 解除后进入
  ┌─────────────────────────────────────────────────────────┐
  │  works-trigger (h-[N×100vh])  ← 滚动空间              │
  │  ┌─────────────────────────────────────────────────┐  │
  │  │  sticky-viewport (sticky top-0 h-screen)         │  │
  │  │  ┌───────────────────────────────────────────┐  │  │
  │  │  │  works-track (flex, w-max)               │  │  │
  │  │  │  ┌─────────────────────────────────────┐ │  │  │
  │  │  │  │  global-svg-layer (absolute, 全宽)  │ │  │  │  ← 狂野生曲线层
  │  │  │  │  └── <path id="global-wild-path">   │ │  │  │    随轨道横向滚动
  │  │  │  └─────────────────────────────────────┘ │  │  │
  │  │  │  ┌──────┐┌──────┐┌──────┐              │  │  │
  │  │  │  │Work- ││Work- ││Work- │ ...×N         │  │  │
  │  │  │  │Canvas1││Canvas2││Canvas3│             │  │  │
  │  │  │  └──────┘└──────┘└──────┘              │  │  │
  │  │  └───────────────────────────────────────────┘  │  │
  │  └─────────────────────────────────────────────────┘  │
  │                                                       │
  │  #flying-pony (position: fixed, 视口内静止)           │  ← 吉祥物固定不动
  │                                                       │
  │  progress-indicator (fixed, 右下角)                   │
  └─────────────────────────────────────────────────────────┘
```

**关键约束：**
- WorksSection 完全独立于 MainScrollWrapper 的 GSAP timeline，pinned wrapper 在 Stage 3 结束后自动解除
- 吉祥物使用 `position: fixed` 定在视口内，与 works-track 的横向滚动**完全解耦**

### 3.2 滚动空间计算

```
滚动空间 = (works.length × 100vw) − 100vw = (N − 1) × 100vw
```

| 作品数量 | 滚动空间 | 触发器高度 |
|---------|---------|-----------|
| 4 个 | 300vw | h-[300vh] |
| 6 个 | 500vw | h-[500vh] |
| 8 个 | 700vw | h-[700vh] |
| 10 个 | 900vw | h-[900vh] |

> 高度由 JS 动态计算：`h-[calc((works.length - 1) * 100)]vh`

---

## 四、狂野生曲线系统（Wild Organic Path）

### 4.1 为什么需要"狂野"而非"规整"

参考 unseen.co 的曲线特征：

- **规整曲线的缺陷：** 纯数学正弦波 / 余弦波 / 固定贝塞尔预设过于机械，像"程序生成的波形"，缺乏艺术家的手工感，与精品作品集的气质不符
- **狂野生曲线的优势：** 随机偏移 + 人工控制点偏移，让曲线看起来像手绘的墨迹，视觉上更有温度和灵气，与创意作品集的品牌调性高度匹配

### 4.2 曲线形态设计

每段曲线的形态通过**三层随机偏移**生成：

```
第一层：基础贝塞尔控制点
  → 设定一个合理的基础波幅（±80px ~ ±120px）
  → 控制点 X 位置使用黄金分割（30% / 70%）而非中心对称

第二层：随机扰动（Perlin-like Noise）
  → 在控制点 Y 值上叠加 -30px ~ +30px 的随机偏移
  → 偏移量用 seeded random，确保同一作品在 SSR 和 hydration 期间数值一致

第三层：微抖动（Jitter）
  → 在曲线的中间段额外插入极小的弯折点
  → 模拟手绘线条末端的不确定性
```

**曲线视觉示例（示意）：**

```
自然形态（非数学函数）：
  M 0,0 C 380,-120 900,90 1440,0
  M 1440,0 C 1900,-60 2400,140 2880,0
  M 2880,0 C 3300,100 3800,-80 4320,0

（非对称、Y值有正有负、波幅不一——这就是狂野感）
```

### 4.3 单一全局路径生成

works-track 是一整个横向长条，在其最底层铺设**唯一一个贯穿始末的 SVG**：

```typescript
// 狂野生曲线生成器
const generateWildPath = (works: Work[]): string => {
  const segmentWidth = typeof window !== "undefined"
    ? window.innerWidth
    : 1440;

  // Seeded random：用作品数组长度做种子，保证 SSR 和 hydration 一致
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  };

  let d = `M 0,${segmentWidth * 0.5}`;

  works.forEach((work, index) => {
    const startX = index * segmentWidth;
    const endX   = (index + 1) * segmentWidth;

    // 基础波幅（负数 = 向上波峰，正数 = 向下波谷）
    const baseAmplitude = seededRandom(index * 7 + 1) > 0.5 ? -100 : 80;
    // 随机扰动
    const jitter1 = (seededRandom(index * 13 + 2) - 0.5) * 60;
    const jitter2 = (seededRandom(index * 17 + 3) - 0.5) * 60;

    const cp1x = startX + segmentWidth * 0.3;
    const cp2x = startX + segmentWidth * 0.7;

    // cp1y / cp2y 的不对称性 = 狂野感的关键
    const cp1y = segmentWidth * 0.5 + baseAmplitude + jitter1;
    const cp2y = segmentWidth * 0.5 + (seededRandom(index * 11 + 4) > 0.5 ? -baseAmplitude * 0.6 : baseAmplitude * 0.8) + jitter2;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${segmentWidth * 0.5}`;
  });

  return d;
};
```

### 4.4 渲染方式

```tsx
{/* 全局狂野曲线层：position: absolute inset-0，与 track 同宽 */}
{/* 随 track 一起横向滚动，吉祥物 fixed 不动 → 视错觉 */}
<div id="works-track" className="relative flex h-full w-max">

  {/* SVG 层：absolute inset-0，pointer-events-none，溢出由 sticky-viewport 裁切 */}
  <svg
    className="absolute inset-0 h-full w-full pointer-events-none"
    style={{ overflow: "visible" }}
  >
    <path
      id="global-wild-path"
      d={generateWildPath(works)}
      fill="none"
      stroke="rgba(255,255,255,0.06)"
      strokeWidth="1.5"
    />
  </svg>

  {/* 画布层 */}
  {works.map((work, i) => (
    <WorkCanvas key={work.id} work={work} index={i} />
  ))}
</div>
```

**注意：** SVG 的 `style={{ overflow: "visible" }}` 允许曲线延伸到画布边界外，由 sticky-viewport 的 `overflow: hidden` 做统一裁切。

### 4.5 曲线动态绘制效果（Phase 2）

使用 `stroke-dashoffset` 实现"线条随滚动被画出"：

```typescript
useGSAP(() => {
  const path = document.querySelector("#global-wild-path") as SVGPathElement;
  if (!path) return;

  const length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

  gsap.to(path, {
    strokeDashoffset: 0,
    ease: "none",
    scrollTrigger: {
      trigger: "#works-trigger",
      start: "top top",
      end: () => `+=${track.scrollWidth - window.innerWidth}`,
      scrub: 1,
    },
  });
});
```

---

## 五、吉祥物固定视错觉系统（Fixed Pony — Optical Illusion）

### 5.1 核心原理

吉祥物**完全不移动**，仅凭背景层的横向滚动产生视错觉：

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│            背景曲线层（随 track 向左滚动）                 │
│  ─────────────────────────────────────────────────────   │ ← 曲线滚动
│                                                          │
│                      🐎 ← 吉祥物（fixed，完全静止）        │ ← 固定不动
│                                                          │
│  作品画布层（随 track 向左滚动）                          │
│                                                          │
└──────────────────────────────────────────────────────────┘

用户感知："吉祥物沿着曲线飞！"
物理实际："曲线在吉祥物后面滚过去。"
```

### 5.2 吉祥物定位

```tsx
{/* 吉祥物：position: fixed，与 works-track 的滚动完全解耦 */}
// 典型位置：视口右侧 60% ~ 80% 水平，垂直居中偏上或偏下
// 具体位置由设计师根据曲线视觉走向决定，确保曲线经过吉祥物"脚下"
<div
  id="flying-pony"
  className="fixed right-[15%] top-[40%] z-50 pointer-events-none"
>
  {/* 吉祥物 SVG（发光小马/任意图形） */}
  <PonySVG />
</div>
```

**位置设计原则：**
- 吉祥物应被放置在曲线**视觉上"经过"的位置**
- 由于曲线是狂野的，吉祥物的位置选择应经过视觉调试，找到曲线最"有机"的段落
- 可选：吉祥物有一个极微小的 **Y 轴呼吸动画**（`gsap.to(pony, { y: ±5px, duration: 2, yoyo: true, repeat: -1 })`），制造"活着"的感觉，但 Y 振幅极小，不影响整体固定感

### 5.3 GSAP 绑定（固定，不绑定路径）

```typescript
// 吉祥物只有呼吸动画，与曲线滚动完全无关
useGSAP(() => {
  const pony = document.querySelector("#flying-pony") as HTMLElement;
  if (!pony) return;

  // 极微小的呼吸效果，让吉祥物看起来"活着"而非"死物"
  gsap.to(pony, {
    y: 6,
    duration: 1.8,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
});

// 曲线的滚动绑定（由 WorksSection 统一管理）
```

### 5.4 为什么这比"真实跟随"更有冲击力

| 维度 | 真实跟随路径 | 固定 + 视错觉（本方案） |
|------|------------|----------------------|
| **物理正确性** | 精确，符合物理直觉 | "错误"——吉祥物根本没动 |
| **视觉震撼度** | 中等，流畅但平淡 | **极高**，用户第一眼会被"欺骗" |
| **实现复杂度** | 需要 MotionPathPlugin | 纯 CSS fixed，零复杂计算 |
| **维护成本** | 多 Path 拼接问题 | 一根 path，全部解决 |
| **有机感** | 机械的线性运动 | 静止中的"呼吸"，更有人味 |

---

## 六、模块化画布系统（WorkCanvas）

### 6.1 单画布规范

每块 `WorkCanvas` 是一个 **100vw × 100vh** 的标准画布，**内部有弹性安全区**：

```
┌─────────────────────────────────────────────────────────────────┐
│ [w1]                                            [Brand, Digital]│
│                                                                      │
│              ┌──────────────────────────────┐                      │
│              │    max-w-7xl 内部安全区        │                      │
│              │    作品主视觉（图片/视频）      │                      │
│              │    标题 / 描述 / 年份           │                      │
│              └──────────────────────────────┘                      │
│                                                                      │
│────────────────────────────────────────────────────────────── ← 曲线层 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 弹性安全区（Flexible Safe Zone）

> 解决超宽屏（34"+ 带鱼屏 / 4K）内容失控问题。

```tsx
<div className="w-screen h-screen flex-shrink-0 relative">
  {/* 内容安全区：限制最大宽度，防止超宽屏破坏排版 */}
  <div className="max-w-7xl mx-auto w-full h-full flex items-center px-8 md:px-16">
    {children}
  </div>
</div>
```

**效果对比：**

| 屏幕宽度 | 物理画布宽度 | 内容区最大宽度 |
|---------|-----------|-------------|
| 13" 笔记本 | 1440px | 1280px |
| 27" 4K | 2560px | 1280px（被约束） |
| 34" 带鱼屏 | 3440px | 1280px（被约束） |

---

## 七、数据模型

### 7.1 works.ts

```typescript
export interface Work {
  id: string;
  title: string;               // 作品标题
  category: string;             // 分类标签
  disciplineId: string;         // 关联的 discipline id
  year: string;               // 年份
  slug: string;                // 详情页 slug
  featured: boolean;            // 是否精选

  // Phase 1 占位
  image: string;               // 主图 URL（空则用渐变占位）

  // Phase 2+ 扩展
  description?: string;        // 作品描述
  tags?: string[];            // 标签数组 e.g. ["Brand", "Digital"]
  videoUrl?: string;           // 视频 URL（Phase 4）
}

export const works: Work[] = [
  {
    id: "w1",
    title: "Modular Speaker System",
    category: "Industrial Design",
    disciplineId: "industrial",
    year: "2024",
    slug: "modular-speaker",
    featured: true,
    image: "",
    description: "A modular speaker system designed for seamless integration into modern living spaces.",
    tags: ["Product", "Industrial"],
  },
  {
    id: "w2",
    title: "Dashboard UI Kit",
    category: "Interface Design",
    disciplineId: "software",
    year: "2024",
    slug: "dashboard-ui",
    featured: true,
    image: "",
    description: "A comprehensive design system for data-driven applications.",
    tags: ["Software", "UI"],
  },
  {
    id: "w3",
    title: "E-Commerce Experience",
    category: "Interaction Design",
    disciplineId: "interaction",
    year: "2023",
    slug: "ecommerce-experience",
    featured: true,
    image: "",
    description: "Immersive shopping experience with seamless transitions.",
    tags: ["Interaction", "Digital"],
  },
  {
    id: "w4",
    title: "Brand Identity System",
    category: "Visual Design",
    disciplineId: "visual",
    year: "2023",
    slug: "brand-identity",
    featured: true,
    image: "",
    description: "Complete brand identity for a tech startup.",
    tags: ["Brand", "Visual"],
  },
];
```

### 7.2 拓展规则

**新增作品流程：**
1. 在 `works.ts` 中添加新对象
2. 滚动空间、轨道宽度、狂野曲线长度**全部自动重算**，零代码修改

---

## 八、组件架构

### 8.1 组件树

```
WorksSection/
├── WorksSection.tsx            ← 根组件：管理滚动触发 + GSAP
├── WorksTrack.tsx              ← 横向卷轴容器（flex row）
│   ├── GlobalWildPath.tsx       ← 唯一狂野生 SVG 曲线（Phase 2）
│   ├── WorkCanvas.tsx           ← 单作品画布（100vw 单元）
│   │   ├── WorkMedia.tsx       ← 作品主视觉（图片/视频占位）
│   │   └── WorkMeta.tsx         ← 标题/描述/年份
│   └── WorksBackground.tsx      ← 背景噪点 + 深色渐变
├── FlyingPony.tsx               ← 吉祥物（fixed，Phase 3）
└── WorksProgress.tsx            ← 固定右下角 [XX%] 进度指示器
```

### 8.2 Props 接口

```typescript
// WorksSection
interface WorksSectionProps {
  works: Work[];
}

// WorksTrack
interface WorksTrackProps {
  works: Work[];
}

// WorkCanvas
interface WorkCanvasProps {
  work: Work;
  index: number;
}

// GlobalWildPath
interface GlobalWildPathProps {
  works: Work[];
}

// FlyingPony — 无需 props，固定位置由 CSS 决定
```

---

## 九、Phase 演进路线

### Phase 1 — MVP：横向卷轴底盘

**目标：** 数据驱动的横向滚动，无曲线，无吉祥物。

**验收标准：**
- [ ] `works.ts` 数据增减后，滚动距离自动重算
- [ ] 窗口 resize 触发 `invalidateOnRefresh` 重新布局
- [ ] 每个 WorkCanvas 内容：渐变占位背景 + 标题居中
- [ ] 右下角 `[XX%]` 进度指示器实时更新
- [ ] works 区域背景 `#030303`，与 Stage 1-3 视觉统一
- [ ] 弹性安全区正常工作

**GSAP 核心逻辑：**

```typescript
useGSAP(() => {
  const track = document.querySelector("#works-track") as HTMLElement;
  const trigger = document.querySelector("#works-trigger") as HTMLElement;
  if (!track || !trigger) return;

  const scrollWidth = track.scrollWidth - window.innerWidth;

  gsap.to(track, {
    x: -scrollWidth,
    ease: "none",
    scrollTrigger: {
      trigger: trigger,
      start: "top top",
      end: () => `+=${scrollWidth}`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    },
  });
});
```

---

### Phase 2 — 狂野生曲线铺设

**目标：** 在 `WorksTrack` 底层渲染一条贯穿所有画布的狂野生贝塞尔曲线。

**新增内容：**
- `GlobalWildPath.tsx`：接收 `works` prop，程序化生成狂野 path d 属性
- `stroke-dashoffset` 动画：曲线随滚动"从左向右被画出"
- 曲线颜色：`rgba(255,255,255,0.05)`，极淡，作为背景存在

**技术要点：**
- `generateWildPath` 使用 seeded random，保证 SSR 和 hydration 一致
- SVG `overflow: visible`，由 sticky-viewport 的 `overflow: hidden` 统一裁切
- 曲线振幅控制在视口高度的 5%–15%，不抢夺作品内容注意力

**验收标准：**
- [ ] 整条曲线视觉上连续无断裂
- [ ] 曲线形态看起来有机、随机，而非规整数学波形
- [ ] 增减 works 数据，曲线长度自动同步
- [ ] 滚动时线条"从左向右被画出"效果流畅

---

### Phase 3 — 吉祥物固定 + 视错觉

**目标：** 吉祥物固定在视口内，与滚动曲线形成视错觉。

**新增内容：**
- `FlyingPony.tsx`：吉祥物 SVG 组件，`position: fixed`
- 极微小呼吸动画（Y 轴 ±6px，duration 1.8s）
- 吉祥物的水平/垂直位置由设计师调试确定（参考 unseen.co 的典型位置）

**关键实现：**

```tsx
{/* FlyingPony.tsx */}
<div
  id="flying-pony"
  className="fixed right-[15%] top-[42%] z-50 pointer-events-none"
>
  <PonySVG />
</div>
```

```typescript
// 呼吸动画：与曲线滚动完全无关，独立运行
useGSAP(() => {
  const pony = document.querySelector("#flying-pony") as HTMLElement;
  if (!pony) return;

  gsap.to(pony, {
    y: 6,
    duration: 1.8,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
});
```

**验收标准：**
- [ ] 吉祥物在视口内完全静止，不随滚动移动
- [ ] 背景曲线滚动时，产生"吉祥物在曲线间飞行"的视错觉
- [ ] 吉祥物有微小的呼吸动画，视觉上"活着"

---

### Phase 4 — 终极打磨

**目标：** 作品悬停放大、视频自动播放、吉祥物节点特效。

| 效果 | 实现方式 |
|------|---------|
| 作品 Hover 放大 | `scale(1.03)` + `duration: 0.6s` ease-out |
| 视频自动播放 | IntersectionObserver + `video.play()` |
| 曲线经过时的粒子效果 | 曲线与吉祥物"交汇点"触发 CSS 粒子动画 |
| 进度数字动画 | `gsap.to(counter, { innerText: percent, snap: { innerText: 1 } })` |

---

## 十、技术约束与边界

### 10.1 性能约束

| 约束 | 应对方案 |
|------|---------|
| 横向平移时重排 | `will-change: transform`，仅 transform 动画 |
| 狂野曲线性能 | 只有一根 SVG path，DOM 极轻 |
| 窗口 resize | `invalidateOnRefresh: true` + `ScrollTrigger.refresh()` |
| SSR 兼容性 | `typeof window` 守卫 + seeded random，保证 hydration 一致 |

### 10.2 GSAP 兼容性

- 使用 `@gsap/react` 的 `useGSAP` hook
- 注册 `ScrollTrigger`（所有 Phase）
- **不需要 MotionPathPlugin**（吉祥物不跟随路径）

### 10.3 响应式策略

| 断点 | 行为 |
|------|------|
| Desktop (≥768px) | 横向滚动正常 |
| Mobile (<768px) | 降级为纵向滚动（Phase 4 可选实现） |

---

## 十一、维护指南

### 11.1 常见修改场景

**场景 A — 新增一个作品：**
```typescript
// 只需修改 works.ts
works.push({
  id: "w5",
  title: "New Project",
  category: "Visual Design",
  disciplineId: "visual",
  year: "2025",
  slug: "new-project",
  featured: false,
  image: "/images/new-project.jpg",
});
```
→ 滚动距离自动增加 100vw，轨道自动延长，狂野曲线自动延伸。**一行代码都不用动。**

**场景 B — 调整吉祥物位置：**
```typescript
// 修改 FlyingPony.tsx 的 className 中的 right/top 值即可
className="fixed right-[12%] top-[38%] z-50"
```

**场景 C — 按分类展示：**
```typescript
const filteredWorks = works.filter(w => w.disciplineId === filter);
```

### 11.2 未来可扩展方向

1. **多吉祥物视错觉**：多个吉祥物固定在不同高度，利用不同曲率区段增强视错觉层次
2. **吉祥物跟随鼠标微偏转**：鼠标接近吉祥物时，吉祥物有一个极微小的反向倾斜（`rotateY ±3deg`）
3. **曲线颜色变化**：随滚动进度，曲线颜色从 `rgba(255,255,255,0.03)` 渐变到 `rgba(255,255,255,0.08)`
4. **背景视频**：Works 区域背景替换为暗调视频

---

## 十二、文件清单

| 文件 | 操作 | 依赖 |
|------|------|------|
| `src/components/WorksSection.tsx` | 新增 | GSAP, ScrollTrigger, works.ts |
| `src/components/WorksTrack.tsx` | 新增 | GlobalWildPath, WorkCanvas |
| `src/components/GlobalWildPath.tsx` | Phase 2 新增 | works.ts |
| `src/components/FlyingPony.tsx` | Phase 3 新增 | GSAP（仅呼吸动画） |
| `src/components/WorkCanvas.tsx` | 新增 | WorkMedia, WorkMeta |
| `src/components/WorkMedia.tsx` | 新增 | — |
| `src/components/WorkMeta.tsx` | 新增 | — |
| `src/components/WorksProgress.tsx` | 新增 | — |
| `src/data/works.ts` | 扩展字段 | — |
| `src/app/page.tsx` | 引入 WorksSection | WorksSection, works |
| `DESIGN_SYSTEM.md` | 同步更新规范 | — |

---

## 十三、版本变更日志

| 版本 | 变更 |
|------|------|
| **v1.0** | 初始设计：每个 WorkCanvas 各自渲染 path |
| **v2.0** | 修复 T1/T2/T3：单一全局 path + 弹性安全区 + MotionPathPlugin 吉祥物跟随 |
| **v3.0** | 核心重构：吉祥物改为 fixed 静止 / 曲线改为狂野生有机形态 / MotionPathPlugin 移除 / 视错觉机制替代真实跟随 |

---

*文档版本：v3.0 | 基于 unseen.co 2025 交互分析 + 视觉参考图*
*核心变更：吉祥物固定 + 狂野生曲线 = 视错觉，而非真实路径跟随*
