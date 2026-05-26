一、 核心架构目标 (Core Objectives)
构建一个基于 PROJECT_DATA 数据驱动的无限横向画卷。在画卷上生成一条连续的物理贝塞尔曲线，并绑定一个飞行精灵（Mascot）。
核心交互原则：
绝对隔离： 轨道与精灵绝对不可在 Stage 1-3（暗黑 Landing 页）中泄露。
基准锁定： 轨道的起点严格锁定在 Stage 4 白色画卷的极左侧，Y 轴高度严格锁定在屏幕物理高度的四分之一 (1/4) 处。
物理抵消： 精灵的飞行速度必须与屏幕横向滚动速度完美抵消，实现“视觉悬停涂色”的顶级质感。
二、 空间与坐标系定义 (Coordinate System)
2.1 容器分布关系
整个网站是一个 w-max 的水平 flex 长条（Master Track）。
[块 A: Landing区] = Stage 1-3。占据 w-screen h-screen flex-shrink-0。背景纯黑。
[块 B: Works区] = Stage 4。占据剩余所有宽度 (w-max)，背景纯白，并且设置 overflow-hidden relative。
2.2 轨道起点的精确数学表达
X 轴原点 (X=0)： 必须在 [块 B] 的最左侧边缘（即紧挨着 [块 A] 的右边缘处）。
Y 轴基准线 (Y=1/4)： 使用 JavaScript 动态计算获取精确的像素值（px）。
code
JavaScript
const viewportHeight = window.innerHeight;
const baselineY = viewportHeight * 0.25; // 例如 1080px 屏幕下，baselineY = 270px
SVG 起点指令： <path d="M 0, ${baselineY} ..." />
三、 DOM 结构与图层堆叠 (Layering & DOM)
Stage 4 的包裹器必须像一个坚固的“白盒子”，包含 3 层结构：
code
Html
<!-- Stage 4 总容器：白底、溢出隐藏（阻断向左泄露） -->
<div id="stage4-wrapper" className="relative h-screen w-max bg-white overflow-hidden flex flex-shrink-0">
  
  <!-- 【底层】虚实双轨 SVG 容器 (贯穿整个 Stage 4 宽度) -->
  <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
    <!-- 1. 底层引导虚线 -->
    <path id="journey-path" fill="none" stroke="#d4d4d8" strokeWidth="2" strokeDasharray="8 8" />
    <!-- 2. 顶层高亮实线 (用于绘制交互) -->
    <path id="journey-path-fill" fill="none" stroke="#09090b" strokeWidth="2" />
  </svg>

  <!-- 【中层】飞行小精灵 (初始挂载在左上角) -->
  <div id="flying-mascot" className="absolute top-0 left-0 z-10 w-4 h-4 bg-black rounded-full mix-blend-normal"></div>

  <!-- 【顶层】作品数据渲染层 -->
  {PROJECT_DATA.map((work) => (
     <div className="relative h-full px-32 flex items-center...">...作品内容...</div>
  ))}

</div>
四、 程序化路径生成算法 (Procedural Path Generation)
绝对不使用写死的 SVG，必须根据数据动态生成。
算法要求：
遍历 PROJECT_DATA 获取作品数量，并计算出预期的总跨度 totalWidth。
设定基准高度：const baseY = window.innerHeight * 0.25; （25% 处）。
使用贝塞尔曲线 C 指令，每隔一定的 px 宽度生成一段波浪。
波峰/波谷计算： 围绕 baseY 上下波动。例如：波峰 y = baseY - 80px，波谷 y = baseY + 80px。
返回一段完整的字符串：M 0, 270 C 150, 190 300, 350 450, 270 ... 注入给两条 <path>。
五、 GSAP 生命周期与联动时序 (The Timeline Orchestra)
这是保证交互不出错的唯一标准执行流，分为 3 个核心生命周期。
生命周期 1：预挂载与隐身 (Initialization)
在 Timeline 建立之前，强制执行以下原生设值，防止闪烁和全显。
code
JavaScript
// 1. 获取动态实线长度
const fillPath = document.querySelector('#journey-path-fill');
const pathLength = fillPath.getTotalLength();

// 2. 强制初始隐身与遮罩
gsap.set(['#flying-mascot', '#journey-path', '#journey-path-fill'], { autoAlpha: 0 });
gsap.set('#journey-path-fill', { strokeDasharray: pathLength, strokeDashoffset: pathLength });
生命周期 2：滑入视口与显形 (Enter & Reveal)
当 Stage 1-3 动画结束，镜头向右平移，Stage 4 刚露出全貌时：
code
JavaScript
// 1. 横向轨道向左推，停止在屏幕左侧 1/5 处 (lockOffset)
tl.to('#master-track', { x: -lockOffset, duration: 1, ease: 'power2.inOut' })

// 2. 锚点：到达位置
.addLabel('stage4-ready')

// 3. 显形：此时解除隐身，因为实线被 offset 盖住，视觉上只会出现【虚线】和【停在屏幕左侧起点的小球】
.to(['#flying-mascot', '#journey-path', '#journey-path-fill'], { autoAlpha: 1, duration: 0.3 }, 'stage4-ready')
生命周期 3：完美追逐与涂色 (Fly & Draw)
这是最后的冲刺阶段，3 个动画必须同起同坐，共用同一个 duration 和 ease: 'none'。
code
JavaScript
const remainScroll = totalTrackWidth - window.innerWidth - lockOffset;

tl.addLabel('fly')

// A. 轨道继续向左推
.to('#master-track', { x: -MaxScroll, duration: remainScroll, ease: 'none' }, 'fly')

// B. 精灵顺着虚线往右飞，自动转头，因为相对运动，视觉上它会停在屏幕 1/5 处上下飞
.to('#flying-mascot', { 
  motionPath: { path: '#journey-path', alignOrigin: [0.5, 0.5], autoRotate: true }, 
  duration: remainScroll, ease: 'none' 
}, 'fly')

// C. 实线 offset 归零，视觉上呈现为“精灵飞过的地方，虚线变成了实线”
.to('#journey-path-fill', { 
  strokeDashoffset: 0, 
  duration: remainScroll, ease: 'none' 
}, 'fly');
👨‍💻 开发者使用建议：
把这份文档发给 Cursor 后，可以配上这句提示词：
"请仔细阅读这份架构与需求文档。它明确了 SVG 的起点在 Stage 4 内部的左侧、Y轴高度在 25vh (转化为 px)、并且详述了解决溢出 Bug 的方案。请基于此文档，为我重构 Stage 4 的 SVG 渲染逻辑和 useGSAP 时间轴代码。"