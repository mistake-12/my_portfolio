# 阶段三开发文档 — 3D 卡片翻转交互

**日期：** 2026-04-22
**负责人：** Developer
**状态：** 待开发

---

## 1. 需求理解

### 1.1 核心交互

当用户在 AboutSection 区域继续向下滚动时，触发 **3D 卡片翻转** 动画，翻转到 **DisciplineSection（作品集目录）**。

### 1.2 目录内容

四个分类标题：
1. 产品设计
2. 软件设计
3. 实习经历
4. 其他项目

---

## 2. 技术方案

### 2.1 关键问题：滚动方向

**问题：** 滑到自我介绍再向下滑动，页面是往下滚动的，但需要触发"翻转到背面"的效果。

**解决方案：** 使用 **滚动进度（scrollProgress）** 而非滚动方向来决定翻转时机。当滚动进度达到某个阈值（如 AboutSection 完成后的 40%-50%），开始触发翻转动画。

### 2.2 组件结构

```
[FlipCard]                 ← 外层容器，管理翻转状态（注意：组件名为 FlipCard）
├── [CardFront]           ← 正面：AboutSection
│   └── AboutSection
└── [CardBack]            ← 背面：DisciplineSection
    └── DisciplineSection
```

### 2.3 3D 翻转实现

| 属性 | 值 |
|------|-----|
| 旋转轴 | rotateX |
| 起点 | 0° |
| 终点 | -180° |
| perspective | 2000px |
| transformStyle | preserve-3d |
| backfaceVisibility | hidden |
| 时长 | 约 1000ms（滚动驱动） |

---

## 3. 滚动触发机制（修正版）

### 3.1 滚动分区（基于 PROJECT_ARCHITECTURE.md）

> ⚠️ 注意：应以 vh 为单位，而非百分比。AboutSection 是**固定在视口中央区域**，不是插入到页面流中。

```
┌──────────────────────────────────────────────────────────────┐
│ 0 - 1.5vh   WelcomeSection 淡出                              │
│              AboutSection 淡入（同步）                         │
├──────────────────────────────────────────────────────────────┤
│ 1.5 - 2.5vh AboutSection 可见                                │
│              固定在视口中央区域                                │
├──────────────────────────────────────────────────────────────┤
│ 3.0 - 3.8vh 3D 翻转动画                                      │
│              AboutSection → DisciplineSection                 │
├──────────────────────────────────────────────────────────────┤
│ 3.8vh+       DisciplineSection 完成                          │
│              继续滚动进入 WorksGrid（阶段四）                  │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 翻转阈值（基于 vh 单位）

假设视口高度 `winH = 900px`：

| 阶段 | 滚动位置 | vh 值 | 说明 |
|------|---------|-------|------|
| About 淡入完成 | winH × 2.5 | 2.5vh | AboutSection 完全显现 |
| 翻转开始 | winH × 3.0 | 3.0vh | 卡片开始翻转 |
| 翻转完成 | winH × 3.8 | 3.8vh | DisciplineSection 完全显示 |

### 3.3 AboutSection 定位特性

> 重要：AboutSection 使用 `position: fixed` 或绝对定位，**固定在视口中央区域**。它不占据页面流空间，而是覆盖在 WelcomeSection 之上。当 AboutSection 完成淡入后，继续滚动会触发卡片翻转。

---

## 4. 组件实现

### 4.1 FlipCard 组件（注意命名）

```tsx
// 文件名：components/FlipCard.tsx
// 伪代码结构
<FlipCard>
  <motion.div
    style={{
      rotateX: rotateX,          // 0° → -180°
      transformPerspective: 2000,
    }}
  >
    <CardFront>AboutSection</CardFront>
    <CardBack>DisciplineSection</CardBack>
  </motion.div>
</FlipCard>
```

### 4.2 动画配置

```tsx
const rotateX = useSpring(
  useTransform(scrollY, [2700, 3420], [0, -180]), // 基于 winH = 900px
  { stiffness: 60, damping: 20, mass: 1 }
);
```

### 4.3 CSS 关键样式

```css
.card {
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.card-front {
  transform: rotateX(0deg);
  backface-visibility: hidden;
}

.card-back {
  transform: rotateX(180deg);
  backface-visibility: hidden;  /* 翻转后背面不可见 */
}
```

---

## 5. DisciplineSection 内容

### 5.1 四个分类

| 序号 | 中文标题 | 英文标签 |
|------|---------|---------|
| 01 | 产品设计 | Product Design |
| 02 | 软件设计 | Software Design |
| 03 | 实习经历 | Internship Experience |
| 04 | 其他项目 | Other Projects |

### 5.2 布局样式

```
背景：     #030303
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
  左侧：     [序号 "01"] [标题 "产品设计"]
  右侧：     [标签 "Product Design"] [箭头 →]
  箭头：     移动端隐藏（md:block）
  悬停效果：  背景从下方滑入；兄弟项暗化至 30%
```

---

## 6. 待确认事项

- [ ] 翻转阈值是否需要根据实际效果调整？
- [ ] 四个分类点击后的行为？（跳转页面 / 展开列表 / 弹窗）
- [ ] 是否需要添加返回 About 的交互？

---

## 7. 开发步骤

1. 创建 `components/FlipCard.tsx` 组件
2. 重构 `page.tsx` 使用 FlipCard 包裹 AboutSection 和 DisciplineSection
3. 实现 3D 翻转动画
4. 实现 DisciplineSection 布局和悬停效果
5. 测试滚动触发时机

---

## 8. 文档差异说明

| 项目 | DEV_DOC_PHASE3.md | PROJECT_ARCHITECTURE.md | 修正 |
|------|-------------------|------------------------|------|
| 组件名 | FlippableCard | FlipCard | ✅ 已修正为 FlipCard |
| 滚动单位 | 百分比 | vh | ✅ 已修正为 vh |
| About 定位 | 未说明 | fixed/绝对定位 | ✅ 已补充 |
| 翻转时机 | 40%-60% | 3.0-3.8vh | ✅ 已对齐 |

---

*看完后请确认开发方向，有问题随时调整。*
