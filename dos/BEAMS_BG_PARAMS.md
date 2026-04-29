# 光束与背景参数文档

> 记录 `Beams` 组件及背景遮罩的完整参数配置，供调试与迭代参考。

---

## 1. Beams 组件参数

### 组件调用位置
```
src/app/page.tsx
```

### Props 列表

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `rotation` | `number` | `30` | 光束组的整体旋转角度（角度制），控制光束倾斜方向 |
| `beamNumber` | `number` | `12` | 光束数量（竖直条状光板的数量） |
| `lightColor` | `string` | `"#ffffff"` | 光源颜色，支持任意十六进制颜色值 |
| `speed` | `number` | `2` | 光束流动速度，影响 Shader 中 `uSpeed` uniform |
| `beamWidth` | `number` | `2` | 单根光束的宽度（Three.js 单位） |
| `beamHeight` | `number` | `15` | 单根光束的高度 |
| `noiseIntensity` | `number` | `1.75` | 噪声强度，影响波纹扭曲的剧烈程度 |
| `scale` | `number` | `0.2` | 噪声缩放，影响波纹的频率 |

### 当前使用配置（三束光：左 / 中 / 右）

```tsx
{/* 左侧光束：倾斜朝右 */}
<div className="absolute inset-0 opacity-15">
  <Beams rotation={-20} beamNumber={5} lightColor="#e0eeff" speed={1.2} />
</div>
{/* 右侧光束：倾斜朝左 */}
<div className="absolute inset-0 opacity-15">
  <Beams rotation={20} beamNumber={5} lightColor="#ffe8d0" speed={1.0} />
</div>
{/* 中心光束 */}
<div className="absolute inset-0 opacity-30">
  <Beams rotation={30} beamNumber={6} lightColor="#ffffff" speed={1.5} />
</div>
```

| 位置 | `rotation` | `beamNumber` | `lightColor` | `speed` | `opacity` |
|------|-----------|--------------|-------------|---------|-----------|
| 左侧 | `-20`（朝右倾斜） | `5` | `#e0eeff`（冷蓝白光） | `1.2` | `0.15` |
| 右侧 | `20`（朝左倾斜） | `5` | `#ffe8d0`（暖橙白光） | `1.0` | `0.15` |
| 中心 | `30`（朝右倾斜） | `6` | `#ffffff`（纯白） | `1.5` | `0.30` |

> 外层 `opacity` 移除了，改为各束光独立控制透明度。

### 内部 Uniform 参数（Shader）

| Uniform | 来源 | 当前值 | 说明 |
|---------|------|--------|------|
| `time` | 自动递增 | 由 `useFrame` 每帧 `+0.1 * delta` | 驱动光束流动动画 |
| `uSpeed` | 传入 `speed` | `1.5` | 控制光束 Z 轴位移速度 |
| `uNoiseIntensity` | 传入 `noiseIntensity` | `1.75`（默认） | 噪声叠加强度 |
| `uScale` | 传入 `scale` | `0.2`（默认） | 噪声采样缩放 |
| `roughness` | 硬编码 | `0.3` | PBR 粗糙度，影响光线散射 |
| `metalness` | 硬编码 | `0.3` | PBR 金属度 |
| `envMapIntensity` | 硬编码 | `10` | 环境贴图强度，增强光感 |

---

## 2. 背景容器参数

### 容器层级结构

```
<main>                          ← z-index 由内容决定
  └─ <div fixed inset-0 z-0>   ← 最外层容器
       ├─ <div absolute opacity-15>  ← 左侧光束层
       │    └─ <Beams rotation=-20>
       ├─ <div absolute opacity-15>  ← 右侧光束层
       │    └─ <Beams rotation=20>
       ├─ <div absolute opacity-30>  ← 中心光束层
       │    └─ <Beams rotation=30>
       └─ <div absolute>              ← 多点径向渐变遮罩
  └─ <MainScrollWrapper />      ← Stage 1/2/3 内容层
```

### 光束层容器

```tsx
<div className="fixed inset-0 z-0 pointer-events-none">
  {/* 三束独立 Beams，各自通过外层 div 的 opacity 控制亮度 */}
  {/* 遮罩改为多点渐变，保护中央文字 */}
</div>
```

| 参数 | 值 | 说明 |
|------|--------|------|
| `position` | `fixed` | 固定视口，不随页面滚动 |
| `z-index` | `0` | 最底层，置于所有内容之下 |
| `pointer-events` | `none` | 不阻挡任何交互 |

> 各光束的亮度通过各自外层 `div` 的 `opacity` 独立控制，而非统一在容器层。

---

## 3. 径向渐变遮罩参数

### 位置
```
src/app/page.tsx — 包裹 <Beams /> 的最底层 div
```

### 当前配置（多点渐变遮罩）

```tsx
<div
  className="absolute inset-0"
  style={{
    background:
      "radial-gradient(ellipse 45% 55% at 50% 50%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)" +
      ", radial-gradient(ellipse 40% 60% at 12% 50%, rgba(0,0,0,0.15) 0%, transparent 100%)" +
      ", radial-gradient(ellipse 40% 60% at 88% 50%, rgba(0,0,0,0.15) 0%, transparent 100%)",
  }}
/>
```

### 渐变参数解析

| 遮罩层 | 椭圆形状 | 中心位置 | 中心透明度 | 说明 |
|--------|---------|---------|-----------|------|
| 中央主遮罩 | `45% 55%` | `50% 50%` | `0.4` = **40%** | 保护中央文字区域，60% 处渐隐至透明 |
| 左侧辅助遮罩 | `40% 60%` | `12% 50%` | `0.05` = **5%** | 左边缘极轻压暗，几乎不遮挡光束 |
| 右侧辅助遮罩 | `40% 60%` | `88% 50%` | `0.05` = **5%** | 右边缘极轻压暗，几乎不遮挡光束 |

> 遮罩层叠加规则：左侧和右侧遮罩极轻，中央遮罩较重，形成"中央暗、两侧亮"的层次感。

---

## 4. 亮度联动逻辑

```
三束光（opacity 独立控制）
  ├─ 左侧光束 opacity-15
  ├─ 右侧光束 opacity-15
  └─ 中心光束 opacity-30
        ↓
多点径向遮罩渐变（中央重、两侧轻）
        ↓
Stage 背景 (bg-transparent 透出光束)
```

三者协同决定最终视觉亮度：
- **各光束 `opacity`**：独立控制左 / 中 / 右三束光的明暗
- **多点遮罩渐变**：中央压暗保护文字，左右两侧极轻让光束透出
- **Stage 背景透明**：`bg-transparent` 确保光束穿透三个 Stage

---

## 5. GSAP Stage 层级（勿动）

| Stage | z-index | 用途 |
|-------|---------|------|
| `#stage1` | `z-30` | 初始可见，消失时在最前 |
| `#stage2` | `z-20` | 中间过渡层 |
| `#stage3` | `z-10` | 3D 翻转目标层 |

> 修改光束参数不影响 Stage 层级结构，请勿改动 `#stage1/2/3` 的 `absolute inset-0` 定位。
