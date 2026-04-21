# JONY MA. 作品集 — 设计系统

---

## 1. 品牌 Identity

### 1.1 品牌概念

作品集承载的是**编辑级精准感与暗奢极简主义的融合**——灵感源自高端时尚杂志、建筑类作品集与设计大奖画册。整体美学传达的是一种克制而有力的高端感，不靠堆砌装饰来彰显品质。

**名称：** JONY MA.
**标语：** Creative Designer
**性格：** 自信、考究、沉稳有力
**调性：** 极简、精准、电影感

---

## 2. 色彩系统

### 2.1 核心调色板

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-bg` | `#030303` | 主背景（欢迎页、正文） |
| `--color-surface` | `#050505` | 作品区域背景 |
| `--color-card` | `#111111` | 作品卡片背景 |
| `--color-border-subtle` | `rgba(255,255,255,0.05)` | 默认卡片边框、分隔线 |
| `--color-border-default` | `rgba(255,255,255,0.10)` | 列表项边框 |
| `--color-border-hover` | `rgba(255,255,255,0.25)` | 悬停边框 |
| `--color-text-primary` | `#FFFFFF` | 标题、主要文字 |
| `--color-text-secondary` | `#A1A1AA` | 副标题、标签（zinc-400） |
| `--color-text-muted` | `#52525B` | 弱化 / 禁用态 |
| `--color-accent` | `#FFFFFF` | 强调色（链接、箭头） |
| `--color-overlay` | `rgba(255,255,255,0.05)` | 卡片悬停背景、列表项填充层 |

### 2.2 语义色

| Token | 色值 | 用途 |
|-------|------|------|
| `--color-success` | `#22c55e` | 状态：Available（绿色） |
| `--color-tag-bg` | `rgba(255,255,255,0.06)` | 标签药丸背景 |

### 2.3 CSS 自定义属性

```css
:root {
  --color-bg: #030303;
  --color-surface: #050505;
  --color-card: #111111;
  --color-border-subtle: rgba(255, 255, 255, 0.05);
  --color-border-default: rgba(255, 255, 255, 0.10);
  --color-border-hover: rgba(255, 255, 255, 0.25);
  --color-text-primary: #ffffff;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #52525b;
  --color-accent: #ffffff;
  --color-overlay: rgba(255, 255, 255, 0.05);
  --color-tag-bg: rgba(255, 255, 255, 0.06);
  --color-success: #22c55e;
}
```

---

## 3. 字体系统

### 3.1 字体搭配

| 角色 | 字体 | 字重 | 用途 |
|------|------|------|------|
| **展示 / 英雄区** | Cormorant Garamond | 600–700（Bold） | 欢迎标题、分类标题 |
| **正文 / UI** | Space Grotesk | 300–700 | 所有正文、标签、导航 |
| **等宽 / 点缀** | Space Mono | 400 | 序号（"01"）、标签、元数据 |

### 3.2 字号阶梯

```
展示 XL：  9xl（96px+）   — 英雄区名字 "JONY MA." 桌面端
展示 L：   7xl–8xl（72px）— 桌面端分类标题
展示 M：   5xl–6xl（48px）— 欢迎页名字；区块标题
标题：     3xl–4xl（30px）— 作品卡片标题；About 问候语
正文：     xl–2xl（20px）  — 简介正文
标签：     sm–base（14px） — 标签、元数据
辅助：     xs（12px）      — 版权、提示文字
```

### 3.3 字体规格详解

| 元素 | 字体 | 字号 | 字重 | 字间距 | 行高 | 颜色 |
|------|------|------|------|--------|------|------|
| 英雄区标签（"WELCOME TO MY PORTFOLIO"） | Space Grotesk | 12px | 400 | 0.3em | 1.0 | white/70 |
| 英雄区名字（"JONY MA."） | Cormorant Garamond | 响应式 6xl→9xl | 700 | -0.03em | 0.9 | white |
| 英雄区副标题（"Creative Designer"） | Space Grotesk | 18px | 300 | 0.2em | 1.0 | zinc-400 |
| About 问候语（"Hello, I'm Ming"） | Space Grotesk | 48px | 600 | 0 | 1.1 | white |
| 简介正文 | Space Grotesk | 18px | 300 | 0 | 1.7 | zinc-400 |
| 分类中文标题 | Cormorant Garamond | 48–72px | 700 | -0.02em | 1.0 | white |
| 分类英文标签 | Space Grotesk | 14px | 400 | 0.15em | 1.0 | zinc-500 |
| 分类序号 | Space Mono | 14px | 400 | 0 | 1.0 | zinc-600 |
| 作品卡片标题 | Space Grotesk | 30px | 600 | -0.01em | 1.1 | zinc-400→white（悬停） |
| 作品分类标签 | Space Grotesk | 12px | 400 | 0.2em | 1.0 | zinc-600 |
| 作品年份 | Space Mono | 14px | 400 | 0 | 1.0 | zinc-600 |
| 区块标签 | Space Grotesk | 11px | 500 | 0.3em | 1.0 | white/60 |
| 页脚链接 | Space Grotesk | 14px | 400 | 0 | 1.0 | white/50→white |

---

## 4. 间距系统

基准单位：`4px`，所有间距值均为 4 的倍数。

| Token | 数值 | 用途 |
|-------|------|------|
| `--space-1` | 4px | 微间距 |
| `--space-2` | 8px | 紧凑内联间距 |
| `--space-3` | 12px | 图标与文字间距 |
| `--space-4` | 16px | 组件内部间距 |
| `--space-6` | 24px | 移动端间距 |
| `--space-8` | 32px | 卡片内部间距；移动端区块间距 |
| `--space-10` | 40px | 标签与标题间距 |
| `--space-12` | 48px | 桌面端间距 |
| `--space-16` | 64px | 区块内部边距 |
| `--space-20` | 80px | 大区块分隔 |
| `--space-24` | 96px | 英雄区文字块间距 |
| `--space-32` | 128px | 大留白呼吸空间 |

### 4.1 栅格系统

- **列数：** 12 列栅格
- **间距：** 移动端 24px / 桌面端 32px
- **最大宽度：** `6xl`（1152px）居中
- **About 区块栅格：** 左 5 列 = 头像；右 7 列 = 正文

---

## 5. 动画系统

### 5.1 缓动曲线

| Token | 数值 | 用途 |
|-------|------|------|
| `--ease-elegant` | `cubic-bezier(0.16, 1, 0.3, 1)` | 主入场/退场；所有主要过渡 |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | 悬停显现、背景滑入 |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | 3D 翻转 |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 缩放悬停效果 |

### 5.2 时长阶梯

| Token | 时长 | 用途 |
|-------|------|------|
| `--duration-instant` | 150ms | 颜色/透明度微交互 |
| `--duration-fast` | 300ms | 小型过渡（边框、颜色） |
| `--duration-base` | 500ms | 标准过渡（悬停、滑入） |
| `--duration-slow` | 700ms | 卡片悬停、大型变换 |
| `--duration-entrance` | 1200ms | 阶段入场动画 |

### 5.3 各阶段动画详解

#### 阶段一 — 欢迎入场（级联淡入上滑）

```
元素                          延迟    时长    起点                      终点
───────────────────────────────────────────────────────────────────────────────────
"WELCOME TO MY PORTFOLIO"    0ms    400ms   opacity:0, translateY(20px)  opacity:1, translateY(0)
"JONY MA."                   200ms  400ms   opacity:0, translateY(20px)  opacity:1, translateY(0)
"Creative Designer"          400ms  400ms   opacity:0, translateY(20px)  opacity:1, translateY(0)
```

缓动：`cubic-bezier(0.16, 1, 0.3, 1)`

#### 阶段一 — 欢迎退出（滚动触发）

```
属性      起点    终点        完成进度    Spring 参数
────────────────────────────────────────────────────────
opacity   1       0          40% vh     stiffness 100（无 spring，直接 useTransform）
scale     1       1.5        60% vh     stiffness 80, damping 20
rotateX   0°      60°        80% vh     stiffness 120, damping 20（最快）
blur      0px     20px       100% vh    useTransform（最慢，贯穿全程）
```

滚动距离：2.5 倍视口高度。opacity 无 spring 直接插值（最快）；scale/rotateX 用 spring 包裹（平滑物理感）；blur 贯穿全程保持最慢收尾。

#### 阶段二 — About 入场（与阶段一同步的角色转换）

```
属性      数值
─────────────────────
起点      opacity: 0
终点      opacity: 1
触发      scrollProgress > 0.2，与阶段一退出同步
时长      与阶段一退出重叠
缓动      ease-elegant
特点      无位移动画——在 JONY MA. 消失的同一位置原地浮现
```

#### 阶段三 — 3D 卡片翻转

```
属性          数值
───────────────────────────────
轴            rotateX
起点          0°
终点          -180°
perspective   2000px
transformStyle preserve-3d
时长          约 1000ms（滚动驱动）
```

#### 阶段三 — 分类列表悬停

```
效果                    默认值              悬停值              时长
───────────────────────────────────────────────────────────────────────────
底部边框               border-white/10    border-white/40    500ms
背景滑入               translate-y-full   translate-y-0      500ms ease-out
兄弟项透明度           100%               30%                —
中文标题右移           translate-x-0      translate-x-4      500ms
英文标签左移           translate-x-0      -translate-x-2     500ms
箭头显现               透明度0,-translate-x-4  透明度1,translate-x-0  500ms
```

### 5.4 滚动行为

- 所有滚动联动动画使用 **passive listeners** 保证性能。
- 动画元素设置 `will-change: transform, opacity`。
- 固定定位元素通过 `transform: translateZ(0)` 触发 GPU 加速。

---

## 6. 视觉资产

### 6.1 图标

**图标库：** Lucide React
**线条风格：** 1.5px 描边，24px 默认尺寸
**用途：** 分类列表和作品卡片中的箭头图标

```
箭头：→（Lucide ArrowRight）
  stroke-width: 1.5
  尺寸：移动端 20px，桌面端 24px
```

### 6.2 摄影

| 资产 | 规格 |
|------|------|
| 头像 | 正方形比例，白色 20% 透明度边框，四角装饰短线（8px，1px 描边） |
| 作品缩略图 | 4:5 或正方形比例，无边框，网格纹理叠加 |

### 6.3 装饰元素

| 元素 | 描述 |
|------|------|
| **噪点纹理遮罩** | SVG `feTurbulence` fractalNoise，透明度 0.04，fixed 定位，全屏覆盖 |
| **四角装饰线** | 头像四角的装饰短线：8px，1px 描边，白色 30% 透明度 |
| **网格背景** | 作品卡片上的细微网格纹理（CSS `background-image` 或 SVG pattern） |

### 6.4 MVP 阶段不使用真实图片

头像占位和作品缩略图初期使用 CSS 渐变色和字体代替，真实摄影图在 MVP 之后添加。

---

## 7. 组件规格

### 7.1 WelcomeSection

```
背景：     #030303 + 噪点纹理遮罩（fixed）
布局：     居中 flex column，text-align center
高度：     100vh（全屏，无需额外 padding）
内容：
  ├── 标签：  "WELCOME TO MY PORTFOLIO" — 12px，大写，tracking-widest
  ├── 标题：  "JONY MA." — 响应式 6xl→9xl，Cormorant Garamond Bold
  └── 副标题： "Creative Designer" — 18px，Space Grotesk Light
滚动退出：  scale 1→1.5, rotateX 0→60°, blur 0→20px, opacity 1→0
```

### 7.2 AboutSection

```
定位：      绝对定位，覆盖在 WelcomeSection 正上方，共享同一视口中心位置
背景：      #030303（透过透明头像区可见下方内容）
布局：      12列栅格：[5列头像 | 7列正文]
最大宽度：  6xl 居中
入场动画：  opacity 0→1，与阶段一 JONY MA. 消失同步，原地浮现，无位移动画
───────────────────────────────────────────
头像区：
  比例：    正方形
  边框：    white/20，1px
  四角装饰：4 条短线，8px，1px，白色/30
  叠加层：   渐变色 + "M" 水印
───────────────────────────────────────────
正文区：
  ├── 标题：   "Hello, I'm JONY MA" — 5xl semibold
  ├── 简介：   段落文字 — zinc-400
  └── 标签：   3 个内联药丸（Location/Shanghai, Focus/Design, Status/Available）
  └── CTA：   "Continue to explore" — 小标签
```

### 7.3 DisciplineSection（翻转卡片背面）

```
背景：     #030303（翻转到视图内）
布局：     max-w-6xl 居中
内边距：    py-20 md:py-32
───────────────────────────────────────────
头部：
  ├── 标签：  "Select Discipline" — 11px，大写，tracking-widest
  └── 间距   mb-12 md:mb-20
───────────────────────────────────────────
列表（ul.group）：
  布局：     堆叠项，底部分隔线
  项数：     4 个分类条目
  边框：     border-b border-white/10
  内边距：   py-6 md:py-10
───────────────────────────────────────────
列表项（li.group/item）：
  布局：     flex justify-between items-baseline
  左侧：     [序号 "01"] [标题 "工业设计作品"]
  右侧：     [标签 "Industrial Design"] [箭头 →]
  箭头：     移动端隐藏（md:block）
  悬停效果：  背景从下方滑入；兄弟项暗化至 30%
```

### 7.4 WorksGrid

```
背景：     #050505，顶部边框 white/10
布局：     max-w-6xl 居中
内边距：    py-20 md:py-32
───────────────────────────────────────────
头部：
  ├── 标签：  "Archive" — 11px 大写 tracking
  ├── 标题：  "Selected Works" — 5xl bold
  └── 链接：  "View All →" — 14px，白色
───────────────────────────────────────────
网格：
  列数：    2 列
  间距：    gap-8 md:gap-12
  交错：    第 2、4 项向下偏移 32px
───────────────────────────────────────────
卡片（WorkCard）：
  比例：    4:5 或正方形
  背景：    #111 + 网格纹理
  悬停：    scale(1.05)，标题变白，700ms ease-out
  内容：    [标题] [分类标签] [年份]
```

### 7.5 Footer

```
背景：     #050505
布局：     3 列 flex justify-between items-center
内边距：    py-12
边框：     顶部 border-white/10
───────────────────────────────────────────
第 1 列：   Logo / 名字 "JONY MA."
第 2 列：   社交链接（悬停：white/50→white）
第 3 列：   版权 "© 2025 Jony Ma. All rights reserved."
```

---

## 8. 响应式行为

### 8.1 断点参考

| 名称 | 最小宽度 | 典型设备 |
|------|---------|---------|
| `sm` | 640px | 大屏手机 |
| `md` | 768px | 平板、笔记本 |
| `lg` | 1024px | 桌面显示器 |
| `xl` | 1280px | 大屏桌面 |

### 8.2 关键响应式差异

| 元素 | 移动端（<768px） | 桌面端（≥768px） |
|------|-----------------|-----------------|
| 欢迎页标题 | 6xl | 9xl |
| About 布局 | 纵向堆叠 | 5+7 栅格 |
| 分类列表 | 纵向 flex-col | 横向 flex-row |
| 分类箭头 | 隐藏 | 可见（hidden md:block） |
| 分类间距 | gap-6 | gap-12 |
| 分类内边距 | py-6 | py-10 |
| 作品网格间距 | gap-8 | gap-12 |

---

## 9. 无障碍设计

| 关注点 | 处理方式 |
|--------|---------|
| **颜色对比度** | 所有文字满足 WCAG AA（白色文字 on #030303 = 21:1） |
| **动效敏感** | 尊重 `prefers-reduced-motion`，禁用所有变换和旋转 |
| **键盘导航** | 分类项可聚焦；有可见焦点环 |
| **屏幕阅读器** | 语义化 HTML；纯图标按钮添加 ARIA 标签 |
| **滚动阶段** | 每个区块设置 `id` 便于跳过导航；阶段切换使用 `aria-live` |

---

## 10. Tailwind 配置

### 10.1 扩展主题

```js
// tailwind.config.ts
{
  theme: {
    extend: {
      colors: {
        bg: '#030303',
        surface: '#050505',
        card: '#111111',
        'border-subtle': 'rgba(255,255,255,0.05)',
        'border-default': 'rgba(255,255,255,0.10)',
        'border-hover': 'rgba(255,255,255,0.25)',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      letterSpacing: {
        'ultra-wide': '0.3em',
        'widest': '0.2em',
        'wider-plus': '0.15em',
      },
      animation: {
        'fade-up': 'fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up-delay-1': 'fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
        'fade-up-delay-2': 'fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'elegant': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
}
```

### 10.2 常用 Class 速查表

```html
<!-- 欢迎页标题 -->
<h1 class="font-serif text-6xl md:text-9xl font-bold tracking-tight">JONY MA.</h1>

<!-- 区块标签 -->
<span class="text-xs font-sans font-medium uppercase tracking-ultra-wide text-white/70">WELCOME TO MY PORTFOLIO</span>

<!-- 分类列表项 -->
<li class="group/item border-b border-white/10 py-6 md:py-10 transition-all duration-500 cursor-pointer
           hover:border-white/40 group-hover:opacity-30 hover:!opacity-100">
  <div class="relative z-10 flex flex-col md:flex-row justify-between items-baseline gap-6 md:gap-12">
    <div class="flex items-baseline gap-6 md:gap-8">
      <span class="font-mono text-zinc-600">01</span>
      <h3 class="font-serif text-4xl md:text-7xl font-bold tracking-tight transition-transform duration-500
                 group-hover/item:translate-x-4">工业设计作品</h3>
    </div>
    <div class="flex items-center gap-6">
      <span class="text-xs md:text-sm font-sans uppercase tracking-wider-plus text-zinc-500
                   transition-transform duration-500 group-hover/item:-translate-x-2">Industrial Design</span>
      <svg class="hidden md:block opacity-0 -translate-x-4 transition-all duration-500
                  group-hover/item:opacity-100 group-hover/item:translate-x-0" />
    </div>
  </div>
  <div class="absolute inset-0 bg-white/5 translate-y-full transition-transform duration-500 ease-out
              group-hover/item:translate-y-0 z-0" />
</li>
```

---

## 11. 设计原则总结

1. **黑色是画布** — 近黑背景让内容和动效显得刻意而有电影感。
2. **字体即建筑** — 展示用衬线体制造冲击，几何无衬线体传达清晰。对比制造层次。
3. **动效服务于传达** — 每个动画都有其意义：入场引导方向，滚动退出指引浏览，悬停邀请交互。
4. **克制优于装饰** — 无渐变、无光晕、无阴影。质感来自噪点和网格，而非特效。
5. **内容有呼吸感** — 大留白；不拥挤。间距本身就是设计元素。
6. **渐进式披露** — 内容随滚动逐一显现，创造叙事旅程，而非静态宣传册。

---

*设计系统基于 `start.md` 交互设计规范生成。字号和动画时长在实现阶段可能根据视频演示进行微调。*
