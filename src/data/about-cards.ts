export interface AboutCard {
  id: string;
  title: string;
  emoji: string;
  description: string;
  tags: string[];
  mascotLine: string;
  position: "above" | "below";
  tilt: number;
  width: string;
  offsetX?: string;
  year?: string;
  link?: string;
  linkLabel?: string;
}

export const aboutCards: AboutCard[] = [
  {
    id: "ac1",
    title: "建筑",
    emoji: "🏗️",
    description:
      "两年建筑训练给了我结构思维——先理解力的传递路径，再赋予形态。从物理模型的破坏实验中学会了：优雅的形态源于诚实的受力。空间感、尺度感、构造逻辑，这些成了我理解一切复杂系统的底层框架。",
    tags: ["结构思维", "系统视角", "形式追随力"],
    mascotLine: "那两年教会我：好的设计自己会站立，不需要多余的装饰。",
    position: "above",
    tilt: -2.5,
    width: "39vw",
    year: "2022-2024",
  },
  {
    id: "ac2",
    title: "工业设计",
    emoji: "🎨",
    description:
      "从建筑转到工业设计，尺度从城市缩小到手掌，但追问的方向反了过来——不再从形式出发，而是从「谁在用、在什么场景、有什么感受」出发。学会了用同理心定义问题，用原型验证假设，在用户、技术与商业之间找到平衡点。",
    tags: ["用户共情", "问题定义", "原型验证"],
    mascotLine: "从造房子到造产品，尺度变了，但那个追问始终没变——它真的让人的生活变好了一点吗？",
    position: "below",
    tilt: 3,
    width: "39vw",
    offsetX: "10vw",
    year: "2024-2027",
  },
  {
    id: "ac3",
    title: "个人能力",
    emoji: "🧠",
    description:
      "能拆解复杂业务——把模糊的「不好用」翻译成可执行的产品方案，。能从0到1定义AI产品——识别真实场景、界定MVP边界、用原型快速验证、推动上线并追踪数据闭环。能全栈独立交付——不依赖外部资源，一个人完成从数据库设计到前端动效的完整产品。",
    tags: ["业务拆解", "产品定义", "全栈交付"],
    mascotLine: "我的核心能力就一条：拿到一个模糊的问题，给出一套能跑的方案。",
    position: "above",
    tilt: -3.5,
    width: "39vw",
    offsetX: "0vw",
  },
  {
    id: "ac4",
    title: "技术栈",
    emoji: "🛠️",
    description:
      "设计：Figma · Blender · Rhino · KeyShot。前端：React · Next.js · TypeScript · Tailwind CSS · GSAP · Vue 3。后端：Node.js · PHP(ThinkPHP) · Supabase · WebSocket。AI：Agent 工作流设计 · RAG · LLM 应用。",
    tags: ["全栈", "设计+开发", "AI Native"],
    mascotLine: "设计让我发现问题，代码让我解决问题——两者加起来才完整。",
    position: "below",
    tilt: 2.5,
    width: "39vw",
    offsetX: "10vw",
  },
  {
    id: "ac5",
    title: "联系我",
    emoji: "📮",
    description:
      "对上海、深圳、杭州的机会持开放态度。欢迎通过 GitHub 了解我的更多项目，或直接联系交流。",
    tags: ["Open to Work"],
    mascotLine: "如果我的经历让你感兴趣——来找我聊聊吧！",
    position: "above",
    tilt: -2,
    width: "39vw",
    offsetX: "10vw",
    link: "https://github.com/mistake-12",
    linkLabel: "GitHub",
  },
];
