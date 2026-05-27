export interface Work {
  id: string;
  title: string;
  category: string;
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
  width: "w-[40vw]" | "w-[45vw]" | "w-[55vw]" | "w-[60vw]" | "w-[70vw]" | "w-[75vw]" | "w-[80vw]" | "w-[85vw]";
}

export const works: Work[] = [
  {
    id: "w1",
    title: "Modular Speaker System",
    category: "Product Design",
    disciplineId: "industrial",
    year: "2024",
    image: "",
    slug: "modular-speaker",
    featured: true,
    description: "A modular speaker system designed for seamless integration into modern living spaces.",
    tags: ["Product", "Industrial"],
    // 作品 1：巨型画幅 · 图片靠右 · 垂直靠上
    layout: "img-right",
    alignY: "start",
    width: "w-[85vw]",
  },
  {
    id: "w2",
    title: "Dashboard UI Kit",
    category: "Interface Design",
    disciplineId: "software",
    year: "2024",
    image: "",
    slug: "dashboard-ui",
    featured: true,
    description: "A comprehensive design system for data-driven applications with real-time analytics.",
    tags: ["Software", "UI"],
    // 作品 2：中等画幅 · 图片靠左 · 垂直靠下
    layout: "img-left",
    alignY: "end",
    width: "w-[55vw]",
  },
  {
    id: "w3",
    title: "E-Commerce Experience",
    category: "Interaction Design",
    disciplineId: "interaction",
    year: "2023",
    image: "",
    slug: "ecommerce-experience",
    featured: true,
    description: "Immersive shopping experience with seamless transitions and micro-interactions.",
    tags: ["Interaction", "Digital"],
    // 作品 3：紧凑画幅 · 图上文下文堆叠 · 垂直靠上
    layout: "stacked",
    alignY: "start",
    width: "w-[40vw]",
  },
  {
    id: "w4",
    title: "Brand Identity System",
    category: "Visual Design",
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
  },
  {
    id: "w5",
    title: "Kinetic Typography",
    category: "Motion Design",
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
  },
  {
    id: "w6",
    title: "Generative Art Series",
    category: "Creative Coding",
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
    id: "w7",
    title: "Wayfinding System",
    category: "Environmental Design",
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
  },
  {
    id: "w8",
    title: "Spatial Sound App",
    category: "Sound Design",
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
  },
  {
    id: "w9",
    title: "AR Museum Guide",
    category: "XR Design",
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
    title: "Editorial Design",
    category: "Print & Digital",
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
  },
];
