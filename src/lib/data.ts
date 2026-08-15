export const categories = [
  "Toutes",
  "Trading",
  "Forex",
  "Indices synthétiques",
];

export const testimonials = [
  {
    id: "1",
    name: "Rakotoarimanana T.",
    role: "Trader débutant",
    content: "Grâce à Expert en King TRC, j'ai enfin compris le Forex et je commence à trader de manière disciplinée. La formation est claire et directement applicable.",
    avatar: "RT",
  },
  {
    id: "2",
    name: "Andrianarison M.",
    role: "Trader indices synthétiques",
    content: "La formation en salle m'a permis de structurer ma stratégie et de gérer mes émotions. Je recommande à tous ceux qui veulent progresser sérieusement.",
    avatar: "AM",
  },
  {
    id: "3",
    name: "Rasolofomanana N.",
    role: "Apprenante en ligne",
    content: "Le prix est très accessible et le contenu est de qualité. J'ai pu apprendre à mon rythme et revenir sur les leçons quand je voulais.",
    avatar: "RN",
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-MG", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(price) + " Ar";
}
