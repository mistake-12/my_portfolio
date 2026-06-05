# 顶部导航栏 — Stage4 橙色导航栏

## 需求概述

为个人网站开发顶部导航栏，仅在 Stage4（作品展示阶段）显示，橙色主题，作品按钮带下拉菜单支持分类跳转。

## 功能需求

### 1. 导航项
- **主页**：点击回到页面顶部（Stage1）
- **作品**：hover 显示下拉菜单，包含 4 个分类
- **About Me**：点击跳转到 Stage4 末尾的 About Me 引导页

### 2. 作品下拉菜单
Hover "作品" 时显示下拉框，包含：
- 工业设计 → 跳转到 `category-industrial`
- 软件开发 → 跳转到 `category-software`
- 实习经历 → 跳转到 `category-internship`
- 其他项目 → 跳转到 `category-other`

跳转逻辑复用 `DisciplineContent.tsx` 中的 `scrollToCategory()` 函数。

### 3. 可见性
- **仅在 Stage4 可见**：随 Stage4 reveal 淡入，Stage4 结束后淡出
- 在 Stage1/2/3 期间完全隐藏
- 使用与现有 HUD 层元素（mascot, solidClip, clouds）相同的显示/隐藏时机

### 4. 视觉设计
- **颜色**：橙色 `#FF4D00`（与现有实线轨道、进度条颜色一致）
- **位置**：固定在页面顶部，`fixed top-0 left-0 right-0 z-50`
- **背景**：Stage4 白底区域使用半透明白色背景；暗底区域可考虑深色文字
- **字体**：与现有设计风格一致，使用 font-sans / font-mono
- **风格**：简洁现代，匹配 Unseen Studio 风格

### 5. 技术实现

#### 新文件
- `src/components/NavBar.tsx` — 导航栏组件

#### 修改文件
- `src/app/page.tsx` — 添加 NavBar 到 HUD 层，GSAP 控制显示/隐藏
- `src/components/DisciplineContent.tsx` — 导出 `scrollToCategory` 函数供 NavBar 复用

#### 跳转逻辑
```typescript
// 从 DisciplineContent.tsx 导出 scrollToCategory
// NavBar 中直接调用
// 主页跳转：window.scrollTo / lenis.scrollTo(0)
// About Me：scrollToCategory('about')
```

### 6. 与现有 Stage1 导航的关系
- Stage1 的 `WelcomeContent` 中有占位导航 `[ INDEX ] [ ABOUT ] [ WORK ]`
- Stage1 导航保持不变（它随 Stage1 消失而隐藏）
- 新的 NavBar 是完全独立的组件，在 Stage4 HUD 层渲染

## 验收标准
1. ✅ 导航栏仅在滚动到 Stage4 时出现
2. ✅ 作品 hover 显示下拉菜单，包含 4 个分类
3. ✅ 点击分类可跳转到对应作品区域
4. ✅ 点击主页回到顶部
5. ✅ 点击 About Me 跳转到末尾
6. ✅ 颜色为橙色 `#FF4D00`
7. ✅ 不影响现有动画和交互
