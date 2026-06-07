# About Me — Stage4 末尾自我介绍页

## 目标

把 Stage4 末尾的空占位 CategoryIntro 变成完整的自我介绍页，让访客在浏览完所有作品后了解你这个人。

## 当前状态

```tsx
// src/app/page.tsx 第 694-707 行
<CategoryIntro
  id="category-about"
  title="About Me"
  textPosition="top-right"
  cloudSlots={...}
/>
```

只有标题"About Me"，没有内容。有云朵装饰和橙色引导线，但空白一片。

## 需求

### MVP（本轮实现）

1. **个人照片** — 展示 profile.image，放在页面合适位置
2. **自我介绍段落** — 使用 profile.bio 作为主文案
3. **关键标签** — Location / Focus / Status 三项，以 tag 形式展示
4. **CTA 按钮** — "联系我"或"了解更多"按钮，点击可打开 RAG 对话面板
5. **风格一致** — 与 Stage4 白底/橙色点缀的风格统一

### 布局方案

参考 CategoryIntro 的 textPosition 机制，建议：

```
方案 A：居中大字排版
  ┌─────────────────────────────┐
  │                             │
  │        [个人照片]            │
  │      Hello, I'm 马子航       │
  │                             │
  │   工业设计 × 软件开发          │
  │                             │
  │  [长篇自我介绍文字]           │
  │                             │
  │  [Location] [Focus] [Status] │
  │                             │
  │     [💬 和我聊聊] CTA        │
  │                             │
  └─────────────────────────────┘

方案 B：左右分栏
  ┌─────────────────────────────┐
  │                             │
  │  [照片]    自我介绍文字       │
  │            tags              │
  │            CTA               │
  │                             │
  └─────────────────────────────┘
```

推荐方案 A——简洁、视觉冲击力强、和现在 CategoryIntro 的气质一致。

### 交互

- **CTA 按钮点击** → 打开 RAG 对话面板（调用 `openRagChat()`）
- **滚动进入** → 文字淡入动画（复用现有的 reveal-item 机制）
- **与 RAG 联动** — 小鸟可以弹出关于你的对话，"想了解更多？右键点我"

### 技术实现

**方案：增强 CategoryIntro 组件**

在 `CategoryIntro` 中增加可选的 children/content 属性，让 About Me 这一页可以渲染额外内容。或者创建一个新的 `AboutMeContent` 组件，嵌入 CategoryIntro 内部。

**推荐方案**：给 CategoryIntro 加一个可选 `children` prop，About Me 页面通过 children 传入照片+文字+按钮。

### 涉及文件

| 文件 | 改动 |
|------|------|
| `src/components/CategoryIntro.tsx` | 加 children prop |
| `src/app/page.tsx` | About Me CategoryIntro 中传入内容 |
| `src/data/profile.ts` | 现有数据已足够，不需改 |

### 待确认

- [ ] 布局方案 A 还是 B？
- [ ] CTA 文案："和我聊聊" / "了解更多" / "Chat with me"？
- [ ] 照片尺寸和位置
