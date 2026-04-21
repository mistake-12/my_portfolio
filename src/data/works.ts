export interface Work {
  id: string;
  title: string;
  category: string;
  disciplineId: string;
  year: string;
  image: string;
  slug: string;
  featured: boolean;
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
  },
];
