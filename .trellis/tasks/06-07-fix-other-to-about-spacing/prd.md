# Fix: "Other" 项目分类与 About Me 引导页间距过紧

## 问题
"其他项目" 分类最后一个作品与 "About Me" 引导页之间间距过紧，视觉上几乎贴在一起。

## 根因
`page.tsx` 中，分类引导页之间的 spacer 默认只有 200px，且"About Me"引导页直接在 loop 外部渲染，没有额外的间距控制。

## 修复方案
在"About Me"引导页之前增加一个 spacer div，宽度约 400px。
