# Stage 4 设计交接文档

## 概述

Stage 4 是作品集网站的核心展示区域，采用**横向滚动 + 曲线轨道 + 散点排版**方案。用户向下滚动时，页面固定在 Stage 4，内容向左平移。Stage 4 包含分类入口页（CategoryIntro）+ 作品卡片（WorkCanvas）沿一条曲线轨道逐个展示。

Stage 4 由以下层次组成（从底到顶）：

```
z-index 层级结构
─────────────────
z-0    虚线轨道 SVG（内容层，跟随 master-track 平移）
z-[1]  云朵装饰层（沿轨道散布，有惯性甩尾）
z-[2]  实线轨道 clip（HUD 层，fixed 定位，不跟随平移）
z-[3]  作品卡片层（WorkCanvas × 9，含图片隔离层 z-0 + 文字层 z-10）
z-[5]  分类入口文字层（CategoryIntro，高于云朵）
z-50   HUD 容器（实线 clip + 吉祥物）
z-[100] 飞行吉祥物（fixed 定位，跟随轨道旋转）
z-50   右下角进度器（fixed 定位）
```

---

## 一、轨道系统

### 1.1 路径生成

**核心文件**: `src/app/page.tsx`
**路径模板**: 基于 `Vector64.svg`（3840×653，起点/终点 y=617.125）

**生成流程**:
1. 读取硬编码的 `baseD` 路径字符串
2. 通过 `shiftVector64Y()` 将 Y 坐标平移到 `baselineY = window.innerHeight * 0.75`
3. 通过 `extendPath()` 将路径平铺拼接至 `horizontalDistance`

| 常量 | 值 |
|------|-----|
| `VECTOR64_WIDTH` | 3840 |
| `VECTOR64_BASELINE_Y` | 617.125 |
| `baselineY` | `window.innerHeight * 0.75` |

### 1.2 虚线轨道（内容层）

| 属性 | 值 |
|------|-----|
| 定位 | `absolute`，跟随 `#stage4-wrapper` 平移 |
| z-index | `z-0` |
| 颜色 | `#d4d4d8`（浅灰） |
| 线宽 | `1.5px` |
| 虚线样式 | `strokeDasharray="8 8"` |

### 1.3 实线轨道（HUD 层）

| 属性 | 值 |
|------|-----|
| 定位 | `fixed`，不跟随 `#master-track` 平移 |
| z-index | `z-[2]` |
| 颜色 | `#FF4D00`（橙红强调色） |
| 线宽 | `1.5px` |
| 裁剪窗口 | `left: 0, width: 20vw` |

**对齐公式**:
```
solidX = window.innerWidth + trackX  （使用实时值，非缓存常量）
```

---

## 二、分类入口系统

### 2.1 CategoryIntro 组件

**文件**: `src/components/CategoryIntro.tsx`

每个作品分类前插入一个全屏分类页，类似 PPT 过渡页设计。

| 属性 | 值 |
|------|-----|
| 尺寸 | `100vw × 100vh` |
| 背景色 | `#2E2E2E`（深灰） |
| 标题颜色 | `#FF4D00`（网站强调色） |
| 层级结构 | 背景层(z-0) → 装饰层(z-[1]) → 文字层(z-[5]) |
| 入场动画 | IntersectionObserver 触发，CSS transition 淡入 |

**Props**:
```typescript
interface CategoryIntroProps {
  title: string;        // 分类标题
  subtitle?: string;    // 副标题
  bgColor?: string;     // 背景色，默认 #2E2E2E
  accentColor?: string; // 强调色，默认 #FF4D00
}
```

**使用**: 在 `page.tsx` JSX 中，在对应分类的作品前插入 `<CategoryIntro />`

---

## 三、作品卡片系统

### 3.1 数据模型

**文件**: `src/data/works.ts`

```typescript
interface Work {
  id: string;
  title: string;
  category: string;
  description?: string;
  tags?: string[];
  year: string;
  image: string;
  layout: "img-left" | "img-right" | "stacked";
  alignY: "start" | "center" | "end";
  width: "w-[40vw]" | ... | "w-[160vw]";
  imageConfig?: {
    width: string;
    height: string;
    top?: string;
    right?: string;
    left?: string;
  };
  extraImages?: Array<{
    url: string;
    width: string;
    height: string;
    top?: string;
    left?: string;
    right?: string;
  }>;
  offsetX?: string;     // 文字水平偏移（仅影响文字，不影响图片）
  offsetY?: string;     // 文字垂直偏移
  cardGap?: string;     // 与前一个案例的间距（margin-left）
}
```

### 3.2 当前作品配置（9 个作品，w2 已删除）

| ID | 宽度 | 布局 | 垂直对齐 | imageConfig | extraImages | offsetX | cardGap |
|----|------|------|----------|-------------|-------------|---------|---------|
| w1 | 160vw | img-right | start | w:45vw h:60vh top:8% left:calc(100%-45vw-45%) | 2 extra | 97vw | — |
| w3 | 40vw | stacked | start | — | — | — | 40vw |
| w4 | 70vw | img-right | end | w:38vw h:55vh top:25% right:3% | — | — | — |
| w5 | 60vw | img-left | start | w:32vw h:52vh top:8% left:3% | — | — | — |
| w6 | 45vw | stacked | end | — | — | — | — |
| w7 | 75vw | img-right | start | w:42vw h:58vh top:8% right:3% | — | — | — |
| w8 | 55vw | img-left | end | w:28vw h:50vh top:28% left:3% | — | — | — |
| w9 | 40vw | stacked | start | — | — | — | — |
| w10 | 80vw | img-right | end | w:42vw h:58vh top:25% right:3% | — | — | — |

**w1 详细配置**:
- 三张图片：主图(45vw×60vh) + 图二(22.5vw×30vh) + 图三(33.75vw×40vh)
- 间距均为 250px
- 文字 97vw 偏移，50px 下移

### 3.3 WorkCanvas 组件

**文件**: `src/components/WorkCanvas.tsx`

**三种渲染模式**:
| 模式 | 条件 | 图片 | 文字 |
|------|------|------|------|
| 隔离模式 | `imageConfig` + `image` 存在，非 stacked | absolute 层自由定位 | 单列，max-w-[608px] |
| stacked | `layout === "stacked"` | grid 内图片在上 | 同 grid |
| 普通模式 | 无 imageConfig | grid 双列 | 同 grid |

**关键逻辑**:
- `offsetX` 仅通过 `paddingLeft` 作用于文字，不影响图片
- `offsetY` 通过 `marginTop` 作用于文字
- `cardGap` 通过 `marginLeft` 作用于卡片
- 隔离模式下卡片无 `overflow-hidden`（防止裁切超出卡片边界的图片）

### 3.4 WorkMeta 文字组件

**文件**: `src/components/WorkMeta.tsx`

| 属性 | 值 |
|------|-----|
| 标题颜色 | `#FF4D00` |
| 标题字号 | `text-4xl md:text-5xl lg:text-6xl` |
| 描述宽度 | `w-full` |
| 底部布局 | `flex gap-12` |
| 底部字号 | `text-xs`（12px） |
| View Project | `查看项目` / `View Project`，颜色 `#FF4D00` |

### 3.5 WorkMedia 图片组件

**文件**: `src/components/WorkMedia.tsx`

| 属性 | 值 |
|------|-----|
| 圆角 | `rounded-[15px]` |
| 隔离模式 | `w-full h-full`（填满父容器） |
| 普通模式 | `aspect-[4/3]` |

### 3.6 文字入场动画

当卡片进入视口（`rect.right > 100 && rect.left < innerWidth - 100`），延迟 100ms 添加 `.is-visible`。一次性触发，不反转。

### 3.7 卡片惯性甩尾

| 参数 | 值 |
|------|-----|
| 速度系数 | `* 150` |
| 偏移量系数 | `* 125` |
| 偏移上限 | `[-40, 40]` px |
| weight | `widthVw / 60`（0.67~1.42） |
| 节流 | 每 2 帧运行一次 |

---

## 四、云朵装饰系统

### 4.1 组件结构

**文件**: `src/components/Clouds.tsx`

使用 `forwardRef` + `useState([])`/`useEffect`，SSR 安全。

### 4.2 云朵生成

- **分类入口区域**：4 朵固定云，位于 0-100vw 区域
- **作品区域**：每区域 1-2 朵（`i % 3 === 0 ? 2 : 1`），随 cardGap 偏移
- **垂直限制**：上方 15-50%，下方 65-85%（均在视口内）
- **漂移限制**：driftX 10-35px
- **大小**：scale 0.4-1.4

### 4.3 视觉参数

| 属性 | 值 |
|------|-----|
| 颜色 | `#FFFFFF`（纯白） |
| 阴影 | `filter: drop-shadow(0 8px 8px rgba(0,0,0,0.2))` |
| 可见性 | GSAP 控制：`visibility: hidden` → `visible; opacity: 1` |

### 4.4 云朵惯性甩尾

| 参数 | 值 |
|------|-----|
| 速度系数 | `* 200` |
| 偏移量系数 | `* 300` |
| 偏移上限 | `[-80, 80]` px |
| 节流 | 每 2 帧运行一次 |

---

## 五、GSAP 时间线

**文件**: `src/app/page.tsx`

### 5.1 滚动配置

```javascript
scrollTrigger: {
  trigger: "#master-pin-container",
  start: "top top",
  end: `+=${totalScrollDistance}%`,
  pin: true,
  scrub: 0.5,
}
```

### 5.2 关键参数

| 参数 | 当前值 | 说明 |
|------|--------|------|
| `lockOffset` | `innerWidth * 0.1` | reveal 阶段距离（10vw） |
| `scrub` | `0.5` | 滚动平滑度 |

### 5.3 时间线阶段

```
Stage 1-3 (3D剧场 400vh) → reveal(10vw) → fly → 结束
```

### 5.4 onUpdate 节流

| 操作 | 频率 | 说明 |
|------|------|------|
| 实线同步 | 每帧 | 视觉必需 |
| 吉祥物旋转 | 每帧 | 视觉必需 |
| 云朵 + 卡片弹簧 | 每 2 帧 | 降低 CPU |
| 文字可见性 | 每 4 帧 | 检测频率低 |

### 5.5 缩放处理

监听 `resize`，300ms 防抖后 `window.location.reload()`，确保所有基于 `innerWidth` 的值重新初始化。

---

## 六、快速调参

### 轨道
| 参数 | 当前值 |
|------|--------|
| 虚线颜色 | `#d4d4d8` |
| 虚线线宽 | `1.5px` |
| 实线颜色 | `#FF4D00` |
| 实线线宽 | `1.5px` |
| 实线裁剪宽度 | `20vw` |
| reveal 偏移 | `10vw` |

### 云朵
| 参数 | 当前值 |
|------|--------|
| 速度系数 | `* 200` |
| 偏移量系数 | `* 300` |
| 偏移上限 | `[-80, 80]` |
| 每区域数量 | `i%3===0 ? 2 : 1` |

### 卡片甩尾
| 参数 | 当前值 |
|------|--------|
| 速度系数 | `* 150` |
| 偏移量系数 | `* 125` |
| 偏移上限 | `[-40, 40]` |

### 文字系统
| 参数 | 当前值 |
|------|--------|
| 标题颜色 | `#FF4D00` |
| 隔离模式文字宽度 | `max-w-[608px]` |
| 底部间距 | `gap-12` |
| 底部字号 | `text-xs` |
| 入场延迟 | `100ms` |

### 图片
| 参数 | 当前值 |
|------|--------|
| 圆角 | `rounded-[15px]` |
| w1 三图间距 | `250px` |

---

## 七、文件索引

| 文件 | 职责 |
|------|------|
| `src/app/page.tsx` | 主时间线、轨道生成、惯性甩尾、文字入场检测 |
| `src/app/globals.css` | 全局 CSS 变量、prefers-reduced-motion |
| `src/data/works.ts` | 作品数据模型与配置 |
| `src/components/CategoryIntro.tsx` | 分类入口页组件 |
| `src/components/WorkCanvas.tsx` | 作品卡片容器（三模式渲染） |
| `src/components/WorkMeta.tsx` | 作品文字内容 + 入场动画 |
| `src/components/WorkMedia.tsx` | 作品图片区域 |
| `src/components/Clouds.tsx` | 云朵装饰（生成/渲染/弹簧动画） |
| `src/components/FlyingMascot.tsx` | 飞行吉祥物 |
| `src/components/ui/WorksProgress.tsx` | 右下角进度指示器 |
| `src/lib/extendPath.ts` | SVG 路径平铺拼接工具 |
| `public/cloud.svg` | 云朵 SVG 参考文件 |
