# Stage 4 飞行轨道迁移方案（重构版：固定屏幕 X=20% + 路径采样 Y + 绘制同步）

## 目标

实现一个高性能的横向滚动轨道交互：

- Stage4 内有一条超长 SVG 路径（虚线引导 + 实线绘制）
- 小球（mascot）在屏幕水平位置固定在 20%（X 恒定）
- 随页面纵向滚动（ScrollTrigger pin + scrub），内容（`#master-track`）向左平移
- 小球只在 **Stage4 fly 阶段**出现，且是 **不旋转的圆点**
- 小球的 **Y 值** 根据路径在当前进度的高度上下起伏
- 小球身后绘制实线，绘制进度与滚动进度严格同步
- 解决当前代码的两个核心问题：
  1) 小球横向位置无法真正锁到 20%
  2) 实线绘制速度与滚动/平移不同步（错误使用 pathLength 作为平移距离）

---

## 一、现状问题审计（为什么现在会出 bug）

### 1. 把 pathLength 当作横向平移距离（量纲错误）

- `pathLength = getTotalLength()` 是“弧长”
- 横向平移需要的是“x 方向距离”（px）
- 当路径有起伏时：弧长 > 水平宽度，导致轨道移动与绘制/小球进度无法对齐

**结论：**

- 横向平移必须使用 Stage4 的真实可滚动宽度（px）
- 实线绘制必须使用 `pathLength`（弧长）
- 二者通过同一个 progress（0~1）映射同步，而不是互相替代

### 2. 当前“抵消 trackX”只能做到“不跟着内容走”，不能做到“锁屏幕 20%”

把 mascot 放在 `#stage4-wrapper` 内，再做：

`mascot.x = -trackX`

只能抵消容器平移，让它相对视口“看似停住”，但最终停在哪个 X 位置仍由路径/布局决定，无法强约束为 `0.2 * viewportWidth`。

---

## 二、目标架构（推荐的稳定方案）

### 2.1 DOM / 图层拆分（关键）

**内容层（跟着 `#master-track` 左移）**

- works 卡片
- SVG 轨道（虚线 + 实线）放 `#stage4-wrapper` 内，跟着内容移动（天然对齐）

**HUD 层（不跟着 `#master-track`）**

- mascot 放在 `#master-pin-container` 内的 overlay 层（absolute inset-0）
- mascot 的 X 永远等于 `window.innerWidth * 0.2`
- mascot 的 Y 从路径采样得出

示意：

```
<main id="master-pin-container">         ← pinned
  <div id="master-track">                ← 横向移动
    <div>Stage1-3</div>
    <div id="stage4-wrapper">            ← 内容坐标系
      <svg id="guide-line-svg" />        ← 虚线（内容层）
      <svg id="solid-line-svg" />        ← 实线（内容层）
      {cards...}
    </div>
  </div>

  <div id="stage4-hud">                  ← HUD 坐标系（不动）
    <div id="flying-mascot" />           ← 小球（固定屏幕 X）
  </div>
</main>
```

优势：

- 小球不再依赖 motionPath 做 x/y 坐标，避免抖动与“锁点漂移”
- 锁屏幕 X=20% 是硬约束（直接 set）
- Y 使用 `getPointAtLength` 按进度采样，数学上可严格对齐绘制

---

## 三、统一“进度”定义（一个 progress 驱动全部）

定义 Stage4 fly 阶段的归一化进度 `p`：

- `p = 0`：刚进入 fly
- `p = 1`：fly 结束

用同一个 `p` 同时驱动：

1) `#master-track` 平移（px）

- `trackX = -lockOffset - p * horizontalDistanceFly`
- `horizontalDistanceFly` 必须是 Stage4 在 fly 段需要移动的实际水平距离（px）

2) 实线绘制（弧长）

- `strokeDashoffset = pathLength * (1 - p)`

3) 小球位置（视口坐标）

- `mascotX = viewportWidth * 0.2`
- `mascotY = wrapperTop + pt.y`（pt 从路径按弧长采样得到）

> 注：小球不旋转，因此不使用 `autoRotate`。

---

## 四、路径与坐标系的正确测量方式（必须做对）

### 4.1 横向距离（px）用 Stage4 wrapper 真实宽度

- `stage4Width = stage4Wrapper.scrollWidth`
- `horizontalDistanceFly ≈ stage4Width - window.innerWidth`（再结合 reveal/lock 做分段）

### 4.2 SVG viewBox 宽度用 Stage4 总宽，而不是 horizontalDistance

- `horizontalDistance = masterTrack.scrollWidth - window.innerWidth` 是“可滚动距离”
- 轨道路径 viewBox 应覆盖 Stage4 内容范围：
  - width ≈ `stage4Wrapper.scrollWidth`
  - height = `stage4Wrapper.clientHeight`（或 `window.innerHeight`）

### 4.3 进度采样点的坐标转换

路径点 `pt` 是在 Stage4 内容坐标系（内容层）中的点；小球画在 HUD（视口坐标）中，因此：

- `mascotX` 强制写死为 20% 视口宽
- `mascotY` 使用 `wrapperTop + pt.y` 进行对齐（wrapperTop = stage4Wrapper.getBoundingClientRect().top）

---

## 五、性能策略（避免抖动与卡顿）

1) 禁止在 onUpdate 里反复 query selector：缓存 DOM 引用。

2) 使用 quickSetter 更新 transform：

- `const setX = gsap.quickSetter(mascot, "x", "px")`
- `const setY = gsap.quickSetter(mascot, "y", "px")`
- 每帧只 set 两个数，不创建对象。

3) `getPointAtLength`：

- 优先方案：每帧 1 次 `getPointAtLength`（简单且通常足够）
- 超长路径掉帧时再考虑 LUT（初始化采样 + 快速索引），并在 resize/refresh 重建。

---

## 六、重构实施步骤（按顺序做，确保可回滚）

### Step 1：DOM 调整（分离 HUD）

- 把 `#flying-mascot` 从 `#stage4-wrapper` 移到 `#master-pin-container` 内新建的 HUD：
  - `#stage4-hud`：`absolute inset-0 z-50 pointer-events-none`
  - `#flying-mascot`：圆点（不旋转）
- 保留 SVG 在 `#stage4-wrapper` 内（absolute）

### Step 2：修正测量与 viewBox

- 用 `stage4Wrapper.scrollWidth` 设置路径平铺宽度与 viewBox width
- 不再用 `horizontalDistance` 作为 viewBox 宽（除非两者恰好相等）

### Step 3：重写 fly 阶段驱动方式（一个 progress）

fly 阶段不再使用：

- `motionPath` 来控制 mascot 的 x/y
- `pathLength` 来控制 `#master-track` 的 x

改为：使用同一个 `p` 统一更新三件事：

1) `#master-track` 的 `x`（px）
2) `journeyFill` 的 `strokeDashoffset`（弧长）
3) mascot 的 `y`（来自路径采样）与 `x`（固定 20%）

并且 mascot 只在 fly 阶段 `autoAlpha: 1`，其他阶段保持 `autoAlpha: 0`。

### Step 4：refresh / resize 处理

在 `ScrollTrigger.refresh()` 前后重新测量：

- `stage4Wrapper.scrollWidth`
- `pathLength`
- `wrapperTop`

`invalidateOnRefresh: true` 只对 tween 参数有帮助，不会自动替你重算手动缓存值。

---

## 七、验收标准（针对当前两类 bug）

- [ ] 小球在 fly 期间始终固定在屏幕 X = 20%（误差 < 1px）
- [ ] 小球上下起伏与虚线路径一致（y 对齐）
- [ ] 实线绘制始终与小球进度一致：小球“经过的位置”刚好变成实线
- [ ] 正向/反向滚动都稳定，无跳跃、无累积误差
- [ ] resize 后依然正确（至少在 refresh 后正确）

---

## 八、实现提示（关键公式汇总）

- `p`：fly 段归一化进度（0~1）
- `dashoffset = pathLength * (1 - p)`
- `len = pathLength * p`
- `pt = path.getPointAtLength(len)`
- `mascotX = viewportWidth * 0.2`
- `mascotY = wrapperTop + pt.y`
