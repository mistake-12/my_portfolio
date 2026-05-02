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
  },
];
