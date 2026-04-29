交互细节分解
阶段1：欢迎页面 (滚动 0~2.5vh)
入场动画（名字进来的感觉）—— 关键细节
采用级联式淡入上滑（Cascading Fade-Up），营造优雅的揭幕感：
"WELCOME TO MY PORTFOLIO" 标签 0.2s opacity: 0 → 1, translateY(20px) → 0
"JONY MA." 标题 0.4s 超大字号 (6xl → 9xl 响应式) + Serif字体 (Cormorant Garamond) + 字重bold + tighter字间距
"Creative Designer" 0.6s 细字重 + 宽字间距(tracking-widest) + 灰色
关键质感设置：
悬停效果：
•	"JONY MA." 标题 hover:scale-105，700ms过渡，cursor: default
•	字体：Cormorant Garamond 衬线体，赋予高端、杂志感
•	缓动曲线：cubic-bezier(0.16, 1, 0.3, 1) —— 快速启动、优雅收尾
•	动画时长：1.2s 每元素，级联间隔0.2s
•	背景：纯黑 #030303 + 噪点纹理叠加（SVG fractalNoise，opacity 0.04）
滚动触发效果：
•	scale: 1 → 1.5 (放大1.5倍)
•	rotateX: 0° → 60° (向下倾斜，产生3D透视)
•	blur: 0 → 20px (高斯模糊)
•	opacity: 1 → 0 (淡出)
•	持续时间: 跨越2.5个视口高度 (变慢效果)

 上图照片仅做结构说明
________________________________________
阶段2：自我介绍淡入 (滚动 1.5~2.5vh)
入场动画：
•	起始位置: translateY(120px) 偏下
•	结束位置: translateY(0) 居中
•	透明度: 0 → 1
•	布局: 12列网格，左5列照片+右7列文字
照片区域：
•	正方形比例，白色20%透明度边框
•	四角装饰短线 (8px长，1px描边)
•	内部渐变色块 + 大写"M"水印
右侧内容：
•	"Hello, I'm Ming" (5xl, semibold)
•	个人简介段落 (zinc-400色)
•	三标签组: Location/Shanghai, Focus/Design, Status/Available
•	"Continue to explore" 提示线
________________________________________
阶段3：3D翻转 (滚动 3.0~3.8vh)
翻转逻辑：
•	触发条件: 自我介绍完全居中后
•	rotateX: 0° → -180° (向前翻转)
•	透视: perspective(2000px)
•	transform-style: preserve-3d
翻转背面内容 (4个分类)：
section.face-back (绝对定位，旋转180度)
└── div.max-w-6xl.mx-auto (居中容器)
├── div.mb-12.md:mb-20 (标题区)
│ └── h2 "Select Discipline" (小字、大写、宽字间距)
│
└── ul.group (分类列表容器)
├── li.group/item (项目1 - 工业设计作品)
├── li.group/item (项目2 - 软件设计)
├── li.group/item (项目3 - 交互设计)
└── li.group/item (项目4 - 视觉设计)
单个列表项（li）内部结构
每个 li 采用三层叠加布局：
li (relative, overflow-hidden)
├── div.absolute.inset-0.bg-white/5 (背景滑入层，z-0)
│ └── 悬停时 translate-y-full → translate-y-0
│
└── div.relative.z-10 (内容层)
├── div.flex (左侧信息组)
│ ├── span "01" (序号，font-mono，灰色)
│ └── h3 "工业设计作品" (超大标题，4xl-7xl，bold)
│
└── div.flex (右侧信息组)
├── span "Industrial Design" (英文标签，小字，uppercase)
└── svg (箭头图标，默认隐藏)
悬停交互动画（4层同步）
层级 默认状态 悬停状态 过渡时间
底部边框 border-white/10 border-white/40 500ms
背景滑入 translate-y-full (底部外) translate-y-0 500ms ease-out
列表聚焦 opacity 100% 其他项30%，当前项100% -
文字右移 translate-x-0 translate-x-4 (中文标题右移16px) 500ms
标签左移 translate-x-0 -translate-x-2 (英文标签左移8px) 500ms
箭头显现 opacity 0, -translate-x-4 opacity 100, translate-x-0 500ms
响应式行为
桌面端（md+）：
横向排列：flex-row, items-baseline
两端对齐：justify-between
箭头图标显示：hidden md:block
移动端：
纵向堆叠：flex-col
间距缩小：间距从 gap-12 变为 gap-6
箭头隐藏，仅保留文字
关键CSS类名
/* 列表项基础 /
py-6 md:py-10 / 垂直内边距 /
border-b border-white/10 / 底部分隔线 /
transition-all duration-500 / 统一过渡 */
/* 悬停聚焦效果 /
group-hover:opacity-30 / 列表其他项变暗 /
hover:!opacity-100 / 当前项高亮 /
cursor-pointer / 手型光标 */
/* 背景层 /
bg-white/5 / 5%白色叠加 /
translate-y-full / 初始位置：底部外 /
group-hover/item:translate-y-0 / 悬停滑入 /
ease-out / 减速曲线 /
这个结构的核心是"分组悬停隔离"* —— 利用 group 和 group-hover 实现列表中只有一个项被高亮、其他项变暗的聚焦效果。
 
________________________________________
【阶段4：作品网格】
- 背景：#050505，顶部边框white/10
- 头部："Archive"小标签 + "Selected Works"大标题 + View All链接(带箭头)
- 网格：2列，第2/4项向下偏移32(交错布局)
- 卡片：4:5或square比例，#111背景，网格纹理
- 悬停：背景scale(1.05)，标题变白，700ms ease-out
- 卡片信息：标题(2xl-3xl) + 分类标签(uppercase，tracking-widest) + 年份(右侧)
 
【页脚】
- 三栏布局：Logo | 社交链接 | 版权
- 链接悬停：white/50 → white，过渡动画
【字体】Space Grotesk (300-700)
【风格】极简暗黑，大间距排版，网格装饰背景

