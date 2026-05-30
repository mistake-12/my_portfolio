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
  width: "w-[40vw]" | "w-[45vw]" | "w-[55vw]" | "w-[60vw]" | "w-[70vw]" | "w-[75vw]" | "w-[80vw]" | "w-[85vw]" | "w-[160vw]";
  // 图片独立定位（absolute 脱离 grid）
  imageConfig?: {
    width: string;   // e.g., "45vw", "50%"
    height: string;  // e.g., "60vh", "70%"
    top?: string;    // e.g., "10%", "5vh"
    right?: string;  // e.g., "5%"
    left?: string;   // e.g., "5%"
  };
  // 额外图片（与主图同层 absolute，可独立定位）
  extraImages?: Array<{
    url: string;
    width: string;
    height: string;
    top?: string;
    left?: string;
    right?: string;
  }>;
  // 装饰云朵（absolute 定位在图片附近）
  decorClouds?: Array<{
    left: string;
    top: string;
    scale?: number;
  }>;
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
    title: "E-Commerce Experience",
    category: "Interaction Design",
    categoryId: "industrial",
    disciplineId: "interaction",
    year: "2023",
    image: "",
    slug: "ecommerce-experience",
    featured: true,
    description: "Immersive shopping experience with seamless transitions and micro-interactions.",
    tags: ["Interaction", "Digital"],
    // 作品 3：紧凑画幅 · 图上文下文堆叠 · 垂直靠上（stacked 保持默认布局）
    layout: "stacked",
    alignY: "start",
    width: "w-[40vw]",
    cardGap: "40vw",
  },
  {
    id: "w3",
    title: "Brand Identity System",
    category: "Visual Design",
    categoryId: "industrial",
    disciplineId: "visual",
    year: "2023",
    image: "",
    slug: "brand-identity",
    featured: true,
    description: "Complete brand identity for a tech startup, from logo to design system.",
    tags: ["Brand", "Visual"],
    // 作品 4：宽幅画幅 · 图片靠右 · 垂直靠下
    layout: "img-right",
    alignY: "end",
    width: "w-[70vw]",
    imageConfig: { width: "38vw", height: "55vh", top: "25%", right: "3%" },
  },
  {
    id: "w4",
    title: "Kinetic Typography",
    category: "Motion Design",
    categoryId: "software",
    disciplineId: "motion",
    year: "2023",
    image: "",
    slug: "kinetic-typography",
    featured: true,
    description: "Experimental type animation exploring rhythm, weight, and temporal pacing in letterforms.",
    tags: ["Motion", "Typography"],
    // 作品 5：中等画幅 · 图片靠左 · 垂直靠上
    layout: "img-left",
    alignY: "start",
    width: "w-[60vw]",
    imageConfig: { width: "32vw", height: "52vh", top: "8%", left: "3%" },
  },
  {
    id: "w5",
    title: "Generative Art Series",
    category: "Creative Coding",
    categoryId: "software",
    disciplineId: "creative",
    year: "2022",
    image: "",
    slug: "generative-art",
    featured: true,
    description: "A collection of algorithmic compositions where randomness meets controlled chaos.",
    tags: ["Creative", "Code"],
    // 作品 6：紧凑画幅 · 图上文下文堆叠 · 垂直靠下
    layout: "stacked",
    alignY: "end",
    width: "w-[45vw]",
  },
  {
    id: "w6",
    title: "Wayfinding System",
    category: "Environmental Design",
    categoryId: "software",
    disciplineId: "environmental",
    year: "2022",
    image: "",
    slug: "wayfinding-system",
    featured: true,
    description: "Comprehensive navigation system for a contemporary art museum spanning 12,000 sqm.",
    tags: ["Environmental", "UX"],
    // 作品 7：宽幅画幅 · 图片靠右 · 垂直靠上
    layout: "img-right",
    alignY: "start",
    width: "w-[75vw]",
    imageConfig: { width: "42vw", height: "58vh", top: "8%", right: "3%" },
  },
  {
    id: "w7",
    title: "Spatial Sound App",
    category: "Sound Design",
    categoryId: "software",
    disciplineId: "audio",
    year: "2022",
    image: "",
    slug: "spatial-sound",
    featured: true,
    description: "Immersive audio interface for binaural music production and spatial audio mastering.",
    tags: ["Sound", "Product"],
    // 作品 8：中等画幅 · 图片靠左 · 垂直靠下
    layout: "img-left",
    alignY: "end",
    width: "w-[55vw]",
    imageConfig: { width: "28vw", height: "50vh", top: "28%", left: "3%" },
  },
  {
    id: "w8",
    title: "AR Museum Guide",
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
    id: "w10",
    title: "New Project A",
    category: "Other Projects",
    categoryId: "internship",
    disciplineId: "other",
    year: "2025",
    image: "",
    slug: "new-project-a",
    featured: true,
    description: "Project description coming soon.",
    tags: ["Other"],
    layout: "stacked",
    alignY: "start",
    width: "w-[45vw]",
  },
  {
    id: "w11",
    title: "New Project B",
    category: "Other Projects",
    categoryId: "internship",
    disciplineId: "other",
    year: "2025",
    image: "",
    slug: "new-project-b",
    featured: true,
    description: "Project description coming soon.",
    tags: ["Other"],
    layout: "stacked",
    alignY: "end",
    width: "w-[45vw]",
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
