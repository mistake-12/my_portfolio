export interface Work {
  id: string;
  title: string;
  category: string;
  categoryId: "industrial" | "software" | "internship" | "other";
  disciplineId: string;
  year: string;
  image: string;
  slug: string;
  featured: boolean;
  // Phase 1+ 扩展
  description?: string;
  tags?: string[];
  // 散点排版控制
  layout: "img-left" | "img-right" | "stacked";
  alignY: "start" | "center" | "end";
  width: "w-[40vw]" | "w-[45vw]" | "w-[55vw]" | "w-[60vw]" | "w-[70vw]" | "w-[75vw]" | "w-[80vw]" | "w-[85vw]" | "w-[120vw]" | "w-[160vw]" | "w-[200vw]" | "w-[250vw]";
  // 图片独立定位（absolute 脱离 grid）
  imageConfig?: {
    width: string;   // e.g., "45vw", "50%"
    height: string;  // e.g., "60vh", "70%"
    top?: string;    // e.g., "10%", "5vh"
    right?: string;  // e.g., "5%"
    left?: string;   // e.g., "5%"
    caption?: string; // 图片下方说明文字
  };
  // 额外图片/视频（与主图同层 absolute，可独立定位）
  extraImages?: Array<{
    url: string;
    width: string;
    height: string;
    top?: string;
    left?: string;
    right?: string;
    caption?: string;  // 图片下方说明文字
    video?: boolean;    // 标记为视频
  }>;
  // 装饰云朵（absolute 定位在图片附近）
  decorClouds?: Array<{
    left: string;
    top: string;
    scale?: number;
  }>;
  // 外部链接
  github?: string;     // GitHub / 项目地址
  linkLabel?: string;  // 按钮文字，默认 "GitHub"
  // 整体内容区水平偏移（正值向右）
  offsetX?: string;  // e.g., "500px", "10vw"
  // 内容区垂直偏移（正值向下）
  offsetY?: string;  // e.g., "50px"
  // 与前一个案例的间距（margin-left）
  cardGap?: string;  // e.g., "300px", "20vw"
}

export const works: Work[] = [
  {
    id: "w1",
    title: "PolarArk极地方舟",
    category: "Product Design",
    categoryId: "industrial",
    disciplineId: "industrial",
    year: "2025",
    image: "https://cloudflare-imgbed-b9a.pages.dev/file/1779973991086_image_1033.png",
    slug: "modular-speaker",
    featured: true,
    description: "基于低感官变化的高纬度地区的交通工具设计，通过设计手段缓解高纬度居民生活的单调与无聊，实现自然温馨的体验。从生存到生活，我们关注的不再只局限于体验，而是他们在这里，可以拥有何种品质的生活。",
    tags: ["Product", "Industrial"],
    // 作品 1：巨型画幅 · 图片靠右 · 垂直靠上（160vw 宽，容纳三张图片）
    layout: "img-right",
    alignY: "start",
    width: "w-[160vw]",
    imageConfig: { width: "45vw", height: "60vh", top: "8%", left: "calc(100% - 45vw - 45%)" },
    extraImages: [
      { url: "https://cloudflare-imgbed-b9a.pages.dev/file/1779973996030_外饰13.png", width: "22.5vw", height: "30vh", top: "calc(45% + 100px)", left: "calc(100% - 45% + 250px)" },
      { url: "https://cloudflare-imgbed-b9a.pages.dev/file/1780131519601_外饰12.png", width: "33.75vw", height: "40vh", top: "calc(45% + 100px - 35vh - 50px)", left: "calc(100% - 45% + 250px + 22.5vw + 250px)" },
      { url: "https://cloudflare-imgbed-b9a.pages.dev/file/1780250950546_Video_Pc2.mp4", width: "33.75vw", height: "19vw", top: "calc(45% + 100px)", left: "calc(100% - 45% + 250px + 22.5vw + 250px + 33.75vw + 100px)", video: true },
      { url: "https://cloudflare-imgbed-b9a.pages.dev/file/1779973999623_内饰图.png", width: "24vw", height: "32vh", top: "calc(45% + 100px - 32vh - 30px - 5vh)", left: "calc(100% - 45% + 250px + 22.5vw + 250px + 33.75vw + 100px + 4.9vw)", caption: "内饰设计" },
    ],
    offsetX: "97vw",
    offsetY: "50px",
    decorClouds: [
      { left: "calc(100% - 45vw - 45% + 5%)", top: "calc(8% + 60vh + 30px)", scale: 0.7 },
      { left: "calc(100% - 45% + 250px + 22.5vw + 250px + 5%)", top: "calc(45% + 100px - 35vh - 50px + 40vh + 30px)", scale: 0.6 },
    ],
  },
  {
    id: "w2",
    title: "无忧萌环",
    category: "Product Design",
    categoryId: "industrial",
    disciplineId: "industrial",
    year: "2025",
    image: "https://cloudflare-imgbed-b9a.pages.dev/file/1780234888494_3.png",
    slug: "epilepsy-monitor-watch",
    featured: true,
    description: "无忧萌环是一个基于肌电+心率的儿童癫痫智能检测手表。癫痫是一种突发性神经疾病，大部分为局灶性运动性癫痫，其表现为短暂的肢体抽动，且较难及时被发现。现阶段检测手段主要依靠脑电判断病情，儿童检测意愿差，同时癫痫缺少日常的检测手段，尤其是在夜晚时期。我们的产品目标是让儿童癫痫发作不再悄无声息，构建医患实时联动的治疗体系，为每一位患儿及家属带来更安心的康复体验。",
    tags: ["Product", "Medical"],
    layout: "img-right",
    alignY: "start",
    width: "w-[160vw]",
    imageConfig: { width: "40vw", height: "55vh", top: "8%", left: "calc(100% - 40vw - 40%)", caption: "外观模型" },
    extraImages: [
      { url: "https://cloudflare-imgbed-b9a.pages.dev/file/1780229654021_image_157.png", width: "28vw", height: "15.9vw", top: "calc(45% + 100px)", left: "calc(100% - 40% + 100px)" },
      { url: "https://cloudflare-imgbed-b9a.pages.dev/file/1780229654941_image_156.png", width: "33.75vw", height: "40vh", top: "calc(45% + 100px - 35vh - 50px)", left: "calc(100% - 40% + 100px + 28vw + 100px)", caption: "功能模型" },
      { url: "https://cloudflare-imgbed-b9a.pages.dev/file/1780229649522_image_155.png", width: "25vw", height: "32vh", top: "calc(45% + 100px)", left: "calc(100% - 40% + 100px + 28vw + 100px + 33.75vw + 100px)" },
    ],
    offsetX: "100vw",
    offsetY: "50px",
    cardGap: "30vw",
  },
  {
    id: "w3",
    title: "Reso-Mate共振伙伴",
    category: "Product Design",
    categoryId: "industrial",
    disciplineId: "industrial",
    year: "2025",
    image: "https://cloudflare-imgbed-b9a.pages.dev/file/1780230766014_aa6a45f1fab4cf93e70c21c7636cdb48.png",
    slug: "reso-mate",
    featured: true,
    description: `一句话描述：属于自闭症患者的打碟机。可以通过旋转旋钮按压等等交互方式将刻板行为转化为节奏性音乐。它将自闭症儿童重复的"自我刺激"行为从一种带有污名的问题转变为一种自我调节的音乐创作过程，为情绪释放提供安全的出口。`,
    tags: ["Product", "Industrial"],
    layout: "img-right",
    alignY: "start",
    width: "w-[70vw]",
    imageConfig: { width: "38vw", height: "55vh", top: "calc(25% - 10vh)", right: "-25vw" },
    offsetX: "20vw",
    cardGap: "50vw",
  },
  {
    id: "w4",
    title: "多模态数据监视平台",
    category: "Full-Stack Development",
    categoryId: "software",
    disciplineId: "software",
    year: "2024",
    image: "https://cloudflare-imgbed-b9a.pages.dev/file/1780242102793_UI.png",
    slug: "prp-sensor-platform",
    featured: true,
    description: `校企合作项目。项目的立意是：按摩的舒适度是主观的感受，但对于企业来说按摩椅的迭代十分需要量化的舒适度来作为迭代的依据。因此我们期望通过多模态数据采集和训练检测模型来进行舒适度评估。这是一个软硬件结合的生理数据（肌电和心率）实时可视化平台，前端Vue3框架后端ThinkPHP8，通过 WebSocket 实现传感器数据的实时采集、推送与可视化展示。支持心率曲线、肌电波形、热力图等多维图表，包含完整的用户管理系统和历史报告分析功能。`,
    tags: ["PHP", "Vue", "WebSocket"],
    github: "https://github.com/mistake-12/prp-project",
    // 作品 5：中等画幅 · 图片靠左 · 垂直靠上
    layout: "img-left",
    alignY: "start",
    width: "w-[120vw]",
    imageConfig: { width: "56vw", height: "31.4vw", top: "8%", left: "calc(3% + 20vw)" },
    extraImages: [
      { url: "https://cloudflare-imgbed-b9a.pages.dev/file/1780245116935_Video_Project_1.mp4", width: "42vw", height: "23.6vw", top: "calc(8% + 40vh)", left: "calc(3% + 20vw + 56vw + 20vw + 120px)", video: true },
    ],
    offsetX: "64vw",
    cardGap: "30vw",
  },
  {
    id: "w5",
    title: "WooJob!!! 求职伙伴",
    category: "Full-Stack Development",
    categoryId: "software",
    disciplineId: "software",
    year: "2025",
    image: "https://cloudflare-imgbed-b9a.pages.dev/file/1780248187314_Video_P.mp4",
    slug: "woojob",
    featured: true,
    description: "（MVP已部署，功能仍在完善中）专为高校毕业生与年轻白领打造的 All-in-One AI 求职全生命周期管理平台。基于 Next.js + Supabase + AI Agent 架构，提供敏捷求职看板、待办日程引擎、AI 求职项目指导及 NLU 极速建档等核心功能，从投递到 Offer 全流程智能化。",
    tags: ["Next.js", "Supabase", "AI"],
    github: "https://woo-job.vercel.app/",
    linkLabel: "打开网址",
    layout: "img-right",
    alignY: "start",
    width: "w-[70vw]",
    imageConfig: { width: "48vw", height: "27.7vw", top: "8%", left: "3%" },
    offsetY: "50vh",
    cardGap: "60vw",
  },
  {
    id: "w6",
    title: "JAKA机器人软件产品实习生",
    category: "Product Design",
    categoryId: "internship",
    disciplineId: "internship",
    year: "2025-2026",
    image: "https://cloudflare-imgbed-b9a.pages.dev/file/1780666244195_之前.webp",
    slug: "jaka-internship",
    featured: true,
    description: "机器人独角兽企业，主要负责离线编程软件的功能迭代与体验优化。主导JAKA机械臂虚拟仿真软件V0.1版本的信息架构重构，缩短核心操作路径，降低认知负担。同时分析需求优先级制定开发计划持续优化功能迭代，提高用户体验；推进Cobopi机器人Web端AI助手语音产品方案的设计与落地，制作PRD文档和方案原型",
    tags: ["Product Design", "B端工具", "AI"],
    github: "https://mp.weixin.qq.com/s/3dwoV9TsAneJKModn0wqVA",
    linkLabel: "相关链接",
    // 作品 6：两张图错落排列 · 上下
    layout: "img-right",
    alignY: "start",
    width: "w-[160vw]",
    imageConfig: { width: "36vw", height: "21.6vw", top: "8%", left: "calc(3% + 35vw)", caption: "JAKA虚拟仿真软件（旧版）" },
    extraImages: [
      { url: "https://cloudflare-imgbed-b9a.pages.dev/file/1780665212206_主页.webp", width: "36vw", height: "21.6vw", top: "calc(8% + 38vh)", left: "calc(3% + 64vw)", caption: "JAKA虚拟仿真软件（迭代）" },
    ],
    offsetX: "0vw",
    cardGap: "30vw",
  },
  {
    id: "w8",
    title: "To be continue...",
    category: "XR Design",
    categoryId: "internship",
    disciplineId: "xr",
    year: "2021",
    image: "",
    slug: "ar-museum-guide",
    featured: true,
    description: "Augmented reality experience layer for historical artifact interpretation and storytelling.",
    tags: ["XR", "AR"],
    // 作品 9：紧凑画幅 · 图上文下文堆叠 · 垂直靠上
    layout: "stacked",
    alignY: "start",
    width: "w-[40vw]",
  },
  {
    id: "w9",
    title: "Editorial Design",
    category: "Print & Digital",
    categoryId: "other",
    disciplineId: "editorial",
    year: "2021",
    image: "",
    slug: "editorial-design",
    featured: true,
    description: "Magazine layout design exploring grid systems, visual hierarchy, and typographic rhythm.",
    tags: ["Editorial", "Print"],
    // 作品 10：巨型画幅 · 图片靠右 · 垂直靠下
    layout: "img-right",
    alignY: "end",
    width: "w-[80vw]",
    imageConfig: { width: "42vw", height: "58vh", top: "25%", right: "3%" },
  },
  {
    id: "w12",
    title: "New Project C",
    category: "Other Projects",
    categoryId: "other",
    disciplineId: "other",
    year: "2025",
    image: "",
    slug: "new-project-c",
    featured: true,
    description: "Project description coming soon.",
    tags: ["Other"],
    layout: "stacked",
    alignY: "start",
    width: "w-[45vw]",
  },
];
