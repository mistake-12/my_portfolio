# Stage 4 设计交接文档

## 概述

Stage 4 采用**横向滚动 + 曲线轨道 + 分类引导页 + 作品散点排版**方案。用户向下滚动时，页面固定在 Stage 4，内容向左平移。包含 4 个分类引导页（CategoryIntro）+ 12 个作品卡片（WorkCanvas）+ 2 个特殊页面（about-me / 空白）。

### z-index 层级
```
z-0    虚线轨道 SVG
z-[1]  云朵装饰层（全局 + 引导页内置）
z-[2]  实线轨道 clip（HUD 层）
z-[3]  作品卡片层
z-[5]  CategoryIntro 文字层
z-50   HUD 容器 + 进度器
z-[100] 飞行吉祥物
```

---

## 一、数据模型（works.ts）

**文件**: `src/data/works.ts`

```typescript
interface Work {
  id: string;                              // DOM id="work-{id}"
  title: string;                           // 标题（橙色 #FF4D00）
  category: string;                        // 分类展示名
  categoryId: "industrial" | "software" | "internship" | "other";  // 用于分组
  year: string;
  image: string;
  description?: string;
  tags?: string[];
  layout: "img-left" | "img-right" | "stacked";
  alignY: "start" | "center" | "end";
  width: string;                           // e.g., "w-[160vw]"
  imageConfig?: { width, height, top?, right?, left? };
  extraImages?: Array<{ url, width, height, top?, left?, right? }>;
  decorClouds?: Array<{ left, top, scale? }>;  // 固定在图片附近的云
  offsetX?: string;                        // 文字水平偏移（仅文字）
  offsetY?: string;                        // 文字垂直偏移
  cardGap?: string;                        // margin-left 间距
}
```

### 当前作品配置（12 个）

| ID | 分类 | 宽度 | 布局 | imageConfig | 特殊配置 |
|----|------|------|------|-------------|----------|
| w1 | industrial | 160vw | img-right | 3 图 | offsetX:97vw + decorClouds×2 |
| w2 | industrial | 40vw | stacked | — | cardGap:40vw |
| w3 | industrial | 70vw | img-right | ✓ | — |
| w4 | software | 60vw | img-left | ✓ | — |
| w5 | software | 45vw | stacked | — | — |
| w6 | software | 75vw | img-right | ✓ | — |
| w7 | software | 55vw | img-left | ✓ | — |
| w8 | internship | 40vw | stacked | — | — |
| w10 | internship | 45vw | stacked | — | — |
| w11 | internship | 45vw | stacked | — | — |
| w9 | other | 80vw | img-right | ✓ | — |
| w12 | other | 45vw | stacked | — | — |

**如何加新作品**: 在 `works.ts` 数组任意位置插入一行，设好 `categoryId`。分组和云朵自动适配。

---

## 二、分类入口系统（CategoryIntro）

**文件**: `src/components/CategoryIntro.tsx`

### 分类列表（page.tsx 中定义 `categoryOrder`）
| 分类 | title | 作品数 |
|------|-------|--------|
| industrial | 工业设计 | 3 |
| software | 软件开发 | 4 |
| internship | 实习经历 | 3 |
| other | 其他项目 | 2 |

### 特殊页面（在所有作品之后）
| 页面 | title | textPosition | hideLine |
|------|-------|-------------|----------|
| about-me | About Me | top-right | — |
| blank | "" | center | true |

### CategoryIntro Props
```typescript
{
  id?: string;                              // DOM id
  title: string;
  subtitle?: string;
  bgColor?: string;                         // 默认 #2E2E2E
  accentColor?: string;                     // 默认 #FF4D00
  textPosition?: "center" | "top-right";    // 文字位置
  hideLine?: boolean;                       // 隐藏橙色指示线
  cloudSlots?: Array<{left?, right?, top?, bottom?, scale, delay}>;  // 自定义云位置
}
```

### 引导页内置云朵
每个 CategoryIntro 有 4 朵云（左上/右上/左下/右下），默认使用 `defaultCloudSlots`，也可通过 `cloudSlots` prop 自定义。使用内联 `<use href="#cloud-shape" />`（符号定义在 Clouds.tsx）。

---

## 三、渲染逻辑（page.tsx）

### 数据驱动分组
`categoryOrder` 定义分类顺序，`works.filter(w => w.categoryId === cat.id)` 自动筛选。新加作品只需改 works.ts，不需动 page.tsx。

### GSAP 时间线
```
Stage 1-3 (3D剧场 2.8 时间线单位) → reveal(1 单位, lockOffset=10vw) → fly(flyDur 单位)
```

- `end` 使用动态函数从 DOM 读取 `masterTrack.scrollWidth`，配合 `invalidateOnRefresh: true` 自动适配内容宽度变化
- onUpdate 节流：云朵+卡片每 2 帧，文字检测每 4 帧

---

## 四、轨道系统

| 属性 | 虚线 | 实线 |
|------|------|------|
| 颜色 | `#d4d4d8` | `#FF4D00` |
| 线宽 | `1.8px` | `1.8px` |
| 样式 | `strokeDasharray="8 8"` | 实线 |
| 定位 | absolute，跟平移 | fixed，不跟平移，clip 20vw |
| 对齐 | — | `solidX = innerWidth + trackX` |

---

## 五、云朵系统

### 全局云（Clouds.tsx）
- 每个作品区域 3 朵，top 15-85% 限制在视口内
- 自动检测 categoryId 变化插入 100vw 间隙
- driftX 10-35px，CSS `cloud-drift` 动画
- 惯性甩尾：速度 `*200`，偏移 `*300`，上限 `[-80,80]`，每 2 帧更新

### 引导页云（CategoryIntro 内置）
- 每页 4 朵，绝对定位
- 可自定义位置（cloudSlots prop）

### 装饰云（decorClouds）
- w1 有两朵固定云在主图和第三张图下方
- 在 WorkCanvas 隔离层中渲染

---

## 六、卡片系统

### WorkCanvas 渲染模式
| 模式 | 条件 | 图片 | 文字 |
|------|------|------|------|
| 隔离 | imageConfig + image | absolute 自由定位 | 单列 max-w-[608px] |
| stacked | layout="stacked" | grid 内图片在上 | 同 grid |
| 普通 | 无 imageConfig | grid 双列 | 同 grid |

### WorkMeta
| 属性 | 值 |
|------|-----|
| 标题颜色 | `#FF4D00` |
| 底部布局 | `flex gap-12`, `text-xs` |
| 描述宽度 | `w-full` |
| 入场 | 100ms 延迟，一次性，不反转 |
| 卡片甩尾 | 速度 `*150`, 偏移 `*125`, 上限 `[-40,40]`, 每 2 帧 |

### WorkMedia
| 属性 | 值 |
|------|-----|
| 圆角 | `rounded-[15px]` |
| 隔离模式 | `w-full h-full` |
| 普通模式 | `aspect-[4/3]` |

---

## 七、Stage 3 跳转逻辑

**文件**: `src/components/DisciplineContent.tsx`

- 点击分类 → `scrollToCategory(target)` 
- 使用数学计算（`getCategoryStarts()` 累加宽度）确定横轴位置
- 转换为 GSAP 时间线对应的 scrollY
- Lenis `duration: 0.5s` 平滑滚动 + 黑屏淡入淡出遮罩（0.25s in / 0.7s out）
- 加作品不影响精度（基于 works 数据动态计算）

---

## 八、快速调参

| 类别 | 参数 | 当前值 |
|------|------|--------|
| 轨道 | 虚线/实线宽 | `1.8px` |
| 轨道 | 实线颜色 | `#FF4D00` |
| 轨道 | reveal 偏移 | `10vw` |
| 云朵 | 速度/偏移/上限 | `*200` / `*300` / `[-80,80]` |
| 云朵 | 每作品数 | `3` |
| 卡片 | 速度/偏移/上限 | `*150` / `*125` / `[-40,40]` |
| 文字 | 隔离宽度 | `max-w-[608px]` |
| 文字 | 标题颜色 | `#FF4D00` |
| 跳转 | Lenis duration | `0.5s` |
| 跳转 | 遮罩淡入/淡出 | `0.25s` / `0.7s` |

---

## 九、文件索引

| 文件 | 职责 |
|------|------|
| `src/app/page.tsx` | 主时间线、轨道生成、分类渲染、惯性甩尾、文字入场 |
| `src/data/works.ts` | 作品数据模型（含 categoryId） |
| `src/components/CategoryIntro.tsx` | 分类入口页（含内置云朵） |
| `src/components/DisciplineContent.tsx` | Stage 3 目录 + 跳转逻辑 |
| `src/components/WorkCanvas.tsx` | 作品卡片（三模式 + decorClouds） |
| `src/components/WorkMeta.tsx` | 文字内容 + 入场动画 |
| `src/components/WorkMedia.tsx` | 图片渲染 |
| `src/components/Clouds.tsx` | 全局云朵（生成 + 弹簧物理） |
| `src/components/FlyingMascot.tsx` | 飞行吉祥物 |
| `src/lib/extendPath.ts` | SVG 路径拼接 |
| `public/cloud.svg` | 云朵 SVG 参考 |
