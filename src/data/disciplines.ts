export interface Discipline {
  id: string;
  number: string;
  title: string;
  subtitle: string;
}

export const disciplines: Discipline[] = [
  {
    id: "industrial",
    number: "01",
    title: "工业设计作品",
    subtitle: "Industrial Design",
  },
  {
    id: "software",
    number: "02",
    title: "软件设计",
    subtitle: "Software Design",
  },
  {
    id: "interaction",
    number: "03",
    title: "交互设计",
    subtitle: "Interaction Design",
  },
  {
    id: "visual",
    number: "04",
    title: "视觉设计",
    subtitle: "Visual Design",
  },
];
