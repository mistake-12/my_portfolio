# JONY MA. 作品集 — 项目架构

## 1. 项目概述

**名称：** JONY MA. 个人作品集网站
**类型：** 单页滚动式作品集（SPA）
**概述：** 一个以滚动驱动为核心的个人作品集网站，通过四个阶段的滚动动画依次展开内容，展示创意设计领域的工作成果。核心交互为一张可 3D 翻转的卡片，在自我介绍与分类选择之间制造叙事感。
**目标用户：** 潜在客户、雇主、设计与技术领域的合作方。

---

## 2. 技术栈

| 层级 | 技术选型 | 选择理由 |
|------|---------|---------|
| **框架** | Next.js 14+（App Router） | SSR、文件路由、图片优化 |
| **样式** | Tailwind CSS v3 + CSS 自定义属性 | 原子化样式 + 设计令牌集成 |
| **动画** | Framer Motion | 滚动联动动画、3D 变换、布局过渡 |
| **语言** | TypeScript | 全链路类型安全 |
| **图标** | Lucide React | 简洁、一致的图标系统 |
| **字体** | Google Fonts（Cormorant Garamond + Space Grotesk） | 编辑感衬线 + 几何无衬线搭配 |
| **部署** | Vercel | Next.js 零配置托管 |

---

## 3. 目录结构

```
profile_website/
├── app/
│   ├── layout.tsx              # 根布局：字体配置、元数据、全局样式
│   ├── page.tsx                # 主页面入口
│   └── globals.css             # Tailwind 指令 + CSS 自定义属性
│
├── components/
│   ├── WelcomeSection.tsx      # 阶段一：欢迎页入场动画
│   ├── AboutSection.tsx        # 阶段二：自我介绍
│   ├── FlipCard.tsx            # 阶段三：3D 翻转容器
│   ├── DisciplineSection.tsx   # 阶段三背面：四个分类卡片
│   ├── WorksGrid.tsx           # 阶段四：作品网格
│   ├── WorksCard.tsx           # 单个作品卡片
│   ├── Footer.tsx              # 页脚
│   ├── ScrollProgress.tsx      # 滚动进度追踪
│   └── NoiseTexture.tsx        # SVG fractalNoise 噪点遮罩
│
├── context/
│   └── ScrollContext.tsx       # 全局滚动状态
│
├── data/
│   ├── disciplines.ts          # 分类数据（四个类别）
│   └── works.ts               # 作品条目数据
│
├── hooks/
│   ├── useScrollProgress.ts    # 滚动进度 hook（0–1）
│   ├── useScrollStage.ts       # 阶段检测 hook（1–4）
│   └── useMousePosition.ts     # 可选：鼠标位移动画
│
├── lib/
│   └── utils.ts                # cn() 辅助函数等
│
├── public/
│   ├── images/
│   │   └── profile.jpg         # 头像图片（用于 AboutSection）
│   └── noise.svg               # 噪点纹理 SVG
│
├── styles/
│   └── animations.css          # 关键帧定义（可选）
│
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. 页面流程与滚动阶段

整个网站是一条**连续滚动的页面**，划分为四个阶段，与滚动位置（虚拟单位）一一对应：

```
vh  0 ─────────── 1.5 ─────────── 2.5 ─────────── 3.0 ─────────── 3.8
    │             │              │              │              │
    │  阶段一     │  阶段二     │              │  阶段三     │  阶段四
    │  Welcome   │  About      │              │  翻转 +     │  Works
    │  欢迎页    │  自我介绍   │              │  分类选择   │  作品网格
    │             │             │              │              │
    3D 放大模糊    │             │              │  卡片背面   │
    退出动画      │             │              │  显现       │
                                   3D 翻转                    │
                                   开始                       │
```

### 阶段一 — 欢迎 / Hero（`scrollY` 0–1.5 vh）
- **涉及组件：** `WelcomeSection`、`NoiseTexture`
- **行为：** 文字三件套级联淡入上滑出场。滚动触发退出动画：scale 1→1.5、rotateX 0→60°、blur 0→20px、opacity 1→0，跨越 2.5 vh。

### 阶段二 — 自我介绍（`scrollY` 1.5–2.5 vh）
- **涉及组件：** `AboutSection`
- **行为：** 与阶段一的退出动画同步——JONY MA. 逐渐消失的同时，About 内容在同一位置原地浮现（opacity 0→1，无位移动画），12 列栅格：左侧 5 列为头像，右侧 7 列为姓名 + 简介 + 标签。两者的 opacity 曲线在时间上无缝衔接，形成"角色转换"的视觉感。

### 阶段三 — 3D 翻转 + 分类选择（`scrollY` 3.0–3.8 vh）
- **涉及组件：** `FlipCard`、`DisciplineSection`
- **行为：** 卡片沿 rotateX 轴 0→−180° 翻转，perspective 2000px。背面露出"Select Discipline"标题 + 4 个分类列表项，带悬停交互。

### 阶段四 — 作品网格（`scrollY` 3.8+ vh）
- **涉及组件：** `WorksGrid`、`WorksCard`、`Footer`
- **行为：** 2 列交错式网格，第 2、4 项向下偏移 32px。

---

## 5. 组件架构

### ScrollContext（Provider）
- 包裹整个应用。
- 对外暴露 `scrollProgress`（全页 0–1）和 `currentStage`（1–4）。
- 通过 passive scroll listener 更新。

### WelcomeSection
- **Props：** 无
- **内部状态：** 挂载时通过 Framer Motion `variants` 触发入场动画。
- **观察：** 借助 `useScrollProgress` + `useTransform` 驱动退出动画。

### AboutSection
- **Props：** `profileImage`、`name`、`bio`、`tags[]`
- **入场：** 与 WelcomeSection 的 scrollYProgress 联动——当 scrollProgress > 0.2 时开始出现，opacity 0→1，无位移动画，在 JONY MA. 消失的同一视觉位置浮现。两者的 opacity 曲线在时间上形成平滑的"角色转换"。
- **布局：** 12 列栅格，固定在视口中央区域，始终占据 WelcomeSection 的位置，而非插入到页面流中。

### FlipCard
- **Props：** `front`（ReactNode）、`back`（ReactNode）
- **实现：** Framer Motion `useMotionValue` + `useTransform` 控制 rotateX。
- **透视：** 父容器设置 perspective 2000px。

### DisciplineSection（卡片背面）
- **Props：** `disciplines[]` — 数组，每项 `{ id, number, title, subtitle }`
- **悬停交互：** 使用 Tailwind `group` / `group-hover` 模式实现兄弟项变暗 + 当前项高亮。
- **无障碍：** 列表项使用 `<a>` 或 `<button>`，确保键盘可聚焦。

### WorksGrid
- **Props：** `works[]` — 数组，每项 `{ id, title, category, disciplineId, year, image, slug, featured }`
- **布局：** CSS Grid，2 列，第 2、4 项通过 nth-child 偏移。

### WorksCard
- **Props：** `work` 对象
- **悬停：** scale(1.05)、标题变白、700ms ease-out。
- **无障碍：** `<article>` 内用 `<a>` 包裹图片 + 标题。

### Footer
- **区块：** Logo | 社交链接 | 版权信息
- **特性：** 静态，无滚动交互。

---

## 6. 数据模型

### Discipline（分类）
```ts
interface Discipline {
  id: string;           // 例如 "industrial"
  number: string;       // 例如 "01"
  title: string;        // 例如 "工业设计作品"
  subtitle: string;     // 例如 "Industrial Design"
}
```

### Work（作品）
```ts
interface Work {
  id: string;
  title: string;
  category: string;
  disciplineId: string;  // 关联到 Discipline.id
  year: string;
  image: string;         // 图片路径
  slug: string;
  featured: boolean;     // 是否精选
}
```

### Profile（个人信息）
```ts
interface Profile {
  name: string;
  greeting: string;     // 例如 "Hello, I'm Ming"
  bio: string;
  location: string;
  focus: string;
  status: string;
  image: string;
}
```

---

## 7. 路由设计

单路由：`/` — 整个作品集是一条滚动的长页面。MVP 阶段无需额外路由。

未来扩展：
- `/work/[slug]` — 单个作品详情页
- `/about` — 延伸版 about 页面
- `/contact` — 联系表单页

---

## 8. 性能策略

| 关注点 | 策略 |
|--------|------|
| **滚动流畅度** | 动画元素设置 `will-change: transform`；使用 passive scroll listener |
| **字体加载** | `next/font` 配合 `display: swap`；预加载首屏字体 |
| **图片优化** | `next/image` 配合 priority 优先加载；WebP 格式 |
| **包体积** | 使用 `next/dynamic` 对首屏以下组件做动态导入 |
| **3D 动画** | 仅使用 GPU 加速属性（`transform`、`opacity`）；避免触发布局的属性 |

---

## 9. 响应式断点

| 断点 | 宽度 | 关键变化 |
|------|------|---------|
| **移动端** | < 768px | 纵向堆叠；隐藏箭头；缩小间距；gap-6 |
| **桌面端** | ≥ 768px | 双栏布局；箭头可见；更大的字体和间距 |

---

## 10. 文件所有权

| 文件 | 负责人 | 说明 |
|------|--------|------|
| `app/layout.tsx` | 开发者 | 字体配置、元数据、全局 Provider |
| `app/page.tsx` | 开发者 | 页面编排、滚动上下文 |
| `components/WelcomeSection.tsx` | 开发者 | 阶段一 |
| `components/AboutSection.tsx` | 开发者 | 阶段二 |
| `components/FlipCard.tsx` | 开发者 | 阶段三翻转逻辑 |
| `components/DisciplineSection.tsx` | 开发者 | 阶段三背面 |
| `components/WorksGrid.tsx` | 开发者 | 阶段四 |
| `components/Footer.tsx` | 开发者 | 页脚 |
| `data/disciplines.ts` | 内容编辑 | 更新分类列表 |
| `data/works.ts` | 内容编辑 | 添加/移除作品条目 |
| `context/ScrollContext.tsx` | 开发者 | 全局滚动状态 |
| `tailwind.config.ts` | 开发者 + 设计师 | 设计令牌同步 |

---

*本文档基于 `start.md` 交互设计规范生成。视频演示用作动画效果的参考；实际文案内容以 `start.md` 为准。*
