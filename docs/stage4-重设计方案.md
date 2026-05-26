# Stage 4 飞行轨道重设计方案

## 一、问题诊断

当前实现存在两个核心 bug，且根源不在实现细节，而在设计思路上。

### Bug 1：小球 Y 位置不跟随路径

**现象**：小球在垂直方向与虚线路径的起伏不一致。

**根因**：代码试图用 `getPointAtLength(len)` 采样 SVG 路径来获取小球 Y 坐标，然后通过 `getBoundingClientRect().top` 做坐标系转换。这条路有多个脆弱点：

- `wrapperTop` 只在 init 时测量一次（第 270 行），pin 后值已变化
- viewBox 坐标系与 CSS 像素的映射依赖 height 严格相等，任何 CSS 偏差都会导致错位
- `getBoundingClientRect()` 在 GSAP scrub 动画进行中调用，返回值不反映真实布局
- 路径的弧长（pathLength）≠ 水平像素距离，Y 采样与水平滚动不同步

### Bug 2：实线绘制与小球不同步

**现象**：实线的终点不总对着小球。

**根因**：实线用 `strokeDashoffset = pathLength * (1-p)`，小球用 `getPointAtLength(pathLength * p).y`。两者虽然共享同一个 `p`（来自 `{}` tween progress），但：

- `strokeDashoffset` 是即时写入 `element.style`，绕过 GSAP scrub 管线
- 小球位置的计算链路经过 `getBoundingClientRect` + 坐标换算，有延迟和累积误差
- scrub: 0.5 给 `{}` tween 引入了 0.5 秒弹性滞后

---

## 二、Unseen 2025 源码分析

通过抓取 https://2025.unseen.co/ 的 HTML、CSS、JS 源码，我们发现他们的设计思路与我们完全不同。

### 2.1 核心发现：气球不跟随路径

```css
.story__balloon {
  position: fixed;
  left: 31.25rem;    /* ≈ 屏幕 20% */
  top: 60%;           /* 固定！不跟随路径 Y */
}
```

气球的 Y 坐标**完全固定**在视口 60% 处。视觉上路径的 Y 波动在 ±50px 以内（SVG viewBox 高 300），路径始终在气球附近经过，观众自然认为气球在"沿着路径走"。

### 2.2 实线：clip + CSS transform，不是 strokeDashoffset

```javascript
// 唯一的核心动画逻辑（hN 类，js-line handler）
onUpdate: n => {
  this.alt.style.transform = `translate3d(-${n.progress * 100}%, 0, 0)`
}
```

```
┌── story__line-clip (position: fixed, overflow: hidden) ──┐
│  ┌── SVG 32000×300 (position: absolute) ────────────┐    │
│  │  实线路径（完整）                                    │    │
│  │  ← translate3d(-p*100%, 0, 0)                      │    │
│  └────────────────────────────────────────────────────┘    │
└── clip 窗口 ──────────────────────────────────────────────┘
```

- 实线 SVG（全路径）放在一个 `position: fixed` + `overflow: hidden` 的 clip 容器内
- 随滚动进度 `p`，SVG 向左平移 `p*100%`
- clip 窗口只露出到气球位置为止 → 视觉上就是"实线在气球身后绘制"

### 2.3 气球动画：只有旋转

```javascript
setBalloonVelocity = () => {
  this.lastRotation = Ue.utils.interpolate(
    this.lastRotation,
    Ue.utils.clamp(-40, 40, g.SmoothScroll.Lenis.velocity),
    0.04
  );
  this.balloon.style.transform = `rotate(${this.lastRotation}deg) translateX(${this.lastRotation * -8}px)`;
};
```

气球唯一的 JS 动画是：根据 Lenis 平滑滚动的**速度**，给气球一个 ±40° 的旋转摇摆。这给气球增加了"生命力"，但位置完全靠 CSS。

### 2.4 虚线：零动画

虚线 SVG 直接放在内容层，`stroke-dasharray="3 3"`，跟随内容自然滚动。不需要任何 JS 干预。

### 2.5 对比总结

| | 当前实现 | Unseen 2025 |
|---|---|---|
| 气球 Y | `getPointAtLength(p)` 每帧采样 | **`top: 60%` CSS 固定** |
| 气球 X | `lockX = 20vw` JS set | `left: 31.25rem` CSS |
| 气球动画 | 每帧 set x/y | 旋转摇摆（基于滚动速度） |
| 实线 | `strokeDashoffset = path*(1-p)` | **clip容器 + translate3d** |
| 虚线 | `strokeDasharray="8 8"` | `strokeDasharray="3 3"` |
| 每帧操作 | `getPointAtLength` + `getBoundingClientRect` + style 写入 | 1 次 `style.transform` 写入 |

**结论：Unseen 故意避免了所有我们正在踩的坑——不采样路径、不转换坐标系、不耦合弧长与像素。**

---

## 三、推荐新架构

### 3.1 设计原则

1. **气球＝屏幕固定点**：X=20vw, Y=65vh，CSS `position: fixed`，无需任何 JS 坐标计算
2. **实线＝视觉跟随**：用 `strokeDashoffset` 或 clip+transform 驱动绘制，与滚动进度严格对应
3. **虚线＝静态内容**：放内容层，自然滚动
4. **气球生命力**：基于滚动速度的轻微旋转（±15°，因为无 Lenis，用相邻帧进度差近似速度）

### 3.2 DOM 结构

```
<main id="master-pin-container">              ← ScrollTrigger pin
  <div id="master-track">                      ← 水平平移
    <div>Stage 1-3 (3D Theater)</div>
    <div id="stage4-wrapper">                  ← 内容坐标系，白底
      <svg id="guide-line-svg">                ← 虚线（内容层，absolute）
        <path stroke-dasharray="8 8" />
      </svg>
      <svg id="solid-line-svg">                ← 实线（内容层，absolute）
        <path />
      </svg>
      {work cards...}
    </div>
  </div>

  <div id="stage4-hud">                        ← HUD 层（fixed 坐标系）
    <FlyingMascot />                           ← 吉祥物（fixed + 旋转）
  </div>
  <WorksProgress />
</main>
```

### 3.3 层级关系

```
视口 (viewport)
├── #master-track (translateX: 0 → -totalDistance)
│   ├── Stage 1-3 (w-screen)
│   └── #stage4-wrapper (overflow-hidden, w-max)
│       ├── guide-line-svg (absolute, 跟随内容)
│       ├── solid-line-svg (absolute, 跟随内容)
│       └── WorkCanvas × N
│
└── #stage4-hud (absolute inset-0, pointer-events-none, z-50)
    └── FlyingMascot (position: fixed, left: 20vw, top: 65vh)
```

### 3.4 动画管线

```
         Scroll Position
              │
              ▼
    ┌─── progress (0~1) ───┐
    │                       │
    ▼                       ▼
  #master-track X       solid line dashoffset
  (timeline scrub)      (timeline onUpdate)
                                │
                                ▼
                          FlyingMascot 可见性
                          (autoAlpha toggle)
```

---

## 四、关键数值定义

### 4.1 吉祥物位置

| 参数 | 值 | 说明 |
|---|---|---|
| X | `20vw` | 屏幕左侧 20% |
| Y | `65vh` | 屏幕上方 65% |
| 定位方式 | CSS `position: fixed` | 绝对静止于视口 |

### 4.2 轨道参数

| 参数 | 来源 | 用途 |
|---|---|---|
| `horizontalDistance` | `masterTrack.scrollWidth - innerWidth` | track 横向平移总距离 |
| `pathLength` | `journeyFill.getTotalLength()` | 实线 strokeDashoffset |
| `baselineY` | `innerHeight * 0.75` | 路径 Y 基准线（视觉对齐吉祥物） |

### 4.3 进度分段

```
总滚动 = 400vh (3D剧场) + horizontalDistance (px)

Fly 阶段起点：3D剧场结束位置
Fly 阶段终点：总滚动结束位置
Fly 局部进度 p = (总进度 - 剧场进度) / (1 - 剧场进度)
```

---

## 五、动画实现

### 5.1 Timeline 结构

```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: masterContainer,
    start: "top top",
    end: `+=${totalScrollDistance}%`,
    pin: true,
    scrub: 0.5,           // 3D 剧场需要平滑
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
});

// ── 3D 剧场（保持不变）──
tl.to("#stage1", { scale: 1.5, rotateX: 60, opacity: 0, filter: "blur(20px)", duration: 1 })
  .fromTo("#stage2", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.5")
  .to("#stage2, #scroll-indicator", { rotateX: -90, opacity: 0, duration: 0.6 })
  .fromTo("#stage3", { rotateX: 90, opacity: 0 }, { rotateX: 0, opacity: 1, duration: 0.6 })
  .to({}, { duration: 0.1 });

// ── Stage 4 Fly ──
tl.addLabel("stage4-reveal")
  .to("#master-track", { x: -lockOffset, duration: 1, ease: "none" })
  .addLabel("fly")
  .to("#master-track", {
    x: -(lockOffset + flyDistancePx),
    duration: dur,
    ease: "none",
  }, "fly")
  .to(guideSvg, { opacity: 1, duration: 0.8 }, "fly")
  .to(solidSvg, { opacity: 1, duration: 0.3 }, "fly")
  .set(mascot, { autoAlpha: 1 }, "fly")
  // 实线绘制 + 吉祥物旋转
  .to({}, {
    duration: dur,
    ease: "none",
    onUpdate: function () {
      const p = this.progress();  // 当前 tween 的局部进度 (0→1)
      journeyFill.style.strokeDashoffset = String(pathLength * (1 - p));
      // 吉祥物旋转（基于速度，见 5.3）
      updateMascotRotation(p);
    },
  }, "fly")
  .set(mascot, { autoAlpha: 0 });
```

### 5.2 实线绘制（保留 strokeDashoffset 方案）

保留 `strokeDashoffset` 而不是照搬 Unseen 的 clip+transform。理由：

- `strokeDashoffset` 在我们的架构中是正确可用的——实线 SVG 在内容层（与虚线同坐标系），不存在坐标错位
- 去掉了 `getPointAtLength` 之后，唯一导致 "不同步" 的因素（路径采样 vs dashoffset 的相位差）已经消失
- clip+transform 需要额外的 DOM 容器和 fixed 定位计算，增加复杂度

**关键修正**：进度 `p` 必须来自 fly 段的真实水平滚动进度，不是弧长比例。

### 5.3 吉祥物动画

#### 基础位姿（CSS）

```css
.flying-mascot {
  position: fixed;
  left: 20vw;
  top: 65vh;
  transform: translate(-50%, -50%);
  z-index: 100;
  pointer-events: none;
}
```

#### 旋转摇摆（JS）

因为没有 Lenis 平滑滚动来提供 velocity，我们用相邻帧的进度差来近似速度：

```javascript
let prevProgress = 0;
let currentRotation = 0;

function updateMascotRotation(progress) {
  // 用帧间进度差近似滚动速度
  const velocity = (progress - prevProgress) * 100; // 放大到可感知范围
  prevProgress = progress;

  // 平滑旋转，范围 ±15deg
  const targetRotation = Math.max(-15, Math.min(15, velocity * 30));
  currentRotation += (targetRotation - currentRotation) * 0.1; // lerp 平滑

  mascot.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
}
```

#### 空闲浮动（CSS，占位吉祥物自带）

见下一节占位吉祥物设计。

---

## 六、占位吉祥物设计

### 6.1 设计定位

一个简洁的几何角色，用于占位和调试验证交互。后续可替换为自定义设计。

### 6.2 视觉设计

```
    ┌─────────────┐
    │   ◉  ◉     │  ← 两个圆眼（不对称更生动）
    │             │
    │    ──      │  ← 微笑弧线
    │  ╲    ╱    │
    │   ╲  ╱     │  ← 小触角/翅膀（左右各一，用于表现旋转）
    │    ────    │
    └─────────────┘
```

- **主体**：40×40px 圆角矩形，白色填充 + 2px 黑色边框
- **眼睛**：两个 6px 黑圆，一高一低（不对称更生动）
- **嘴**：2px 圆弧
- **触角/翅膀**：左右各一个 CSS border 三角形
- **尺寸**：w-10 h-10（40px，tailwind 标准）
- **默认颜色**：`bg-white border-2 border-zinc-900`

### 6.3 CSS 空闲动画

```css
@keyframes mascot-idle {
  0%, 100% { transform: translate(-50%, -50%) translateY(0); }
  50%      { transform: translate(-50%, -50%) translateY(-6px); }
}

@keyframes mascot-blink {
  0%, 95%, 100% { transform: scaleY(1); }
  97%           { transform: scaleY(0.1); }
}
```

- **浮动**：3s ease-in-out 循环，上下 6px
- **眨眼**：5s 循环，在 97% 处快速闭眼

### 6.4 组件接口

```typescript
// src/components/FlyingMascot.tsx
interface FlyingMascotProps {
  className?: string;
  style?: React.CSSProperties;
}
```

组件通过 `forwardRef` 暴露 DOM 引用，供 GSAP 控制 `autoAlpha`。

---

## 七、实施步骤

### Step 1：创建 FlyingMascot 组件
- 新建 `src/components/FlyingMascot.tsx`
- 实现上述几何角色 + CSS 动画
- 使用 `forwardRef` 暴露 ref

### Step 2：重构 page.tsx JS 逻辑
- 删除以下代码：
  - `getPointAtLength()` 调用及周边逻辑
  - `getBoundingClientRect()` 调用（`wrapperTop`）
  - `setMascotX` / `setMascotY` (gsap.quickSetter)
  - 独立的 `ScrollTrigger.create({ onUpdate })`（不再需要）
  - `lockX` 变量（改为 CSS 控制）
- 修改以下代码：
  - fly 段 `{}` tween 的 onUpdate：只做 `strokeDashoffset` + 旋转速度计算
  - mascot 的显示/隐藏：改为在 timeline 中用 `autoAlpha` toggle
- 新增以下代码：
  - `updateMascotRotation(progress)` 函数

### Step 3：重构 page.tsx JSX
- `<FlyingMascot />` 替换 `<div id="flying-mascot" className="h-2 w-2 rounded-full bg-black" />`
- HUD 层保持 `absolute inset-0 z-50 pointer-events-none`
- 移除 HUD 上的 `left-0 top-0`（由组件 CSS fixed 接管）

### Step 4：测试验收
- [ ] 吉祥物在 fly 期间始终固定在屏幕 20vw, 65vh
- [ ] 实线绘制与滚动进步度严格同步（正向/反向均稳定）
- [ ] 吉祥物有轻微的旋转反应和空闲浮动
- [ ] 正向/反向滚动无跳跃
- [ ] resize 后行为正确（刷新后）

---

## 八、如何替换为自定义吉祥物

### 替换步骤

1. **设计你的吉祥物**：SVG、PNG sprite sheet、或 Lottie 动画
2. **打开 `src/components/FlyingMascot.tsx`**
3. **替换 JSX 内容**：保留最外层 div 的 `ref`、`className`、`style`，替换内部元素
4. **调整位置**：修改 CSS 中的 `left` 和 `top` 值，使吉祥物与轨道对齐
5. **调整尺寸**：修改 `w-* h-*` Tailwind class
6. **保留关键接口**：
   - `ref={ref}` — GSAP 需要通过 ref 控制 autoAlpha
   - `className="fixed pointer-events-none z-100"` — fixed 定位 + 不透鼠标
   - `style={{ left: '20vw', top: '65vh', transform: 'translate(-50%, -50%)' }}`

### 如果你使用 SVG 吉祥物

```tsx
const FlyingMascot = forwardRef<HTMLDivElement, FlyingMascotProps>(
  ({ className = "", style }, ref) => (
    <div
      ref={ref}
      className={`fixed pointer-events-none z-100 ${className}`}
      style={{ left: "20vw", top: "65vh", transform: "translate(-50%, -50%)", ...style }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48">
        {/* 你的 SVG 路径 */}
      </svg>
    </div>
  )
);
```

### 如果你使用 Sprite Sheet

```tsx
<div
  ref={ref}
  className="fixed pointer-events-none z-100"
  style={{
    left: "20vw",
    top: "65vh",
    width: "48px",
    height: "48px",
    backgroundImage: "url('/mascot-sprite.png')",
    backgroundSize: "480px 48px",  // 10 frames
    animation: "mascot-sprite 1s steps(10) infinite",
    transform: "translate(-50%, -50%)",
    ...style,
  }}
/>
```

### 如果你使用 Lottie

```tsx
import { Player } from "@lottiefiles/react-lottie-player";

const FlyingMascot = forwardRef<HTMLDivElement, FlyingMascotProps>(
  ({ className = "", style }, ref) => (
    <div
      ref={ref}
      className={`fixed pointer-events-none z-100 ${className}`}
      style={{ left: "20vw", top: "65vh", transform: "translate(-50%, -50%)", ...style }}
    >
      <Player
        autoplay
        loop
        src="/mascot-animation.json"
        style={{ width: "80px", height: "80px" }}
      />
    </div>
  )
);
```

---

## 九、简化替代方案（clip + transform）

如果你后续想要做得跟 Unseen 一模一样（实线用 clip 容器而不是 strokeDashoffset），见下：

### DOM 新增

```html
<!-- 在 #master-pin-container 内，stage4-hud 之前 -->
<div id="solid-line-clip"
     class="fixed top-0 h-full overflow-hidden pointer-events-none z-40"
     style="left: 0; width: 20vw;">
  <svg id="solid-line-fixed-svg"
       style="position: absolute; top: 0; height: 100%;">
    <path id="journey-path-fixed-fill" fill="none" stroke="#09090b" stroke-width="2" />
  </svg>
</div>
```

### 动画

```javascript
// 替换 onUpdate 中的 strokeDashoffset 行：
solidSvgFixed.style.transform = `translate3d(-${p * 100}%, 0, 0)`;
```

注意：这个方案的实线 SVG 尺寸和位置计算比 strokeDashoffset 更复杂，因为 SVG 的 CSS width/height 必须精确匹配，viewBox 坐标系也要对齐。**建议先完成 strokeDashoffset 方案，稳定后再迁移。**

---

## 十、文件清单

| 文件 | 操作 | 说明 |
|---|---|---|
| `docs/stage4-重设计方案.md` | 新建 | 本文档 |
| `src/components/FlyingMascot.tsx` | 新建 | 占位吉祥物组件 |
| `src/app/page.tsx` | 修改 | 重构动画逻辑 |
