export const homepageSectionKeys = ["categories", "featuredEditorial", "giftAddons", "story"] as const;

export type HomepageSectionKey = (typeof homepageSectionKeys)[number];

export type HomepageSectionCopy = {
  label: string;
  titleEs: string;
  titleEn: string;
  subtitleEs: string;
  subtitleEn: string;
  sortOrder: number;
  images: string[];
  imageLabels: string[];
};

export const homepageSectionDefaults: Record<HomepageSectionKey, HomepageSectionCopy> = {
  categories: {
    label: "Ocasiones",
    titleEs: "Cada ocasión merece flores.",
    titleEn: "Every occasion deserves flowers.",
    subtitleEs: "Desde un gesto pequeño hasta la celebración de tu vida.",
    subtitleEn: "From a small gesture to the celebration of a lifetime.",
    sortOrder: 1,
    images:["/bouquet-editorial.png","/home-sunflowers.webp","/home-roses.webp","/home-wedding.webp","/bouquet-editorial.png","/home-hero.webp"],
    imageLabels:["Ramos de novia","Cumpleaños","Amor y aniversario","Eventos","Condolencias","Personalizados"],
  },
  featuredEditorial: {
    label: "Arreglos destacados",
    titleEs: "Flores que iluminan momentos.",
    titleEn: "Flowers that brighten moments.",
    subtitleEs: "Nuestros arreglos más queridos, listos para hacer de cualquier día algo especial.",
    subtitleEn: "Our most-loved arrangements, ready to make any day feel special.",
    sortOrder: 2,
    images:["/home-hero.webp","/home-sunflowers.webp","/home-roses.webp","/bouquet-editorial.png"],
    imageLabels:["Jardín Rosado","Luz de Primavera","Dulce Amor","Ramo Aurora"],
  },
  giftAddons: {
    label: "Complementos",
    titleEs: "Hazlo aún más especial.",
    titleEn: "Make it even more special.",
    subtitleEs: "Agrega un osito, chocolates, globos o una tarjeta personalizada y crea un momento inolvidable.",
    subtitleEn: "Add a teddy bear, chocolates, balloons or a personalized card and create an unforgettable moment.",
    sortOrder: 3,
    images:["/home-gift-addons.png"],
    imageLabels:["Imagen de complementos"],
  },
  story: {
    label: "Historia de la marca",
    titleEs: "Más que flores, es tu historia.",
    titleEn: "More than flowers, it is your story.",
    subtitleEs: "Desde el ramo de novia hasta el detalle que ilumina un día cualquiera. Creamos atmósferas que se sienten y se recuerdan.",
    subtitleEn: "From a bridal bouquet to the detail that brightens an ordinary day. We create atmospheres that are felt and remembered.",
    sortOrder: 4,
    images:["/bouquet-editorial.png"],
    imageLabels:["Imagen de historia"],
  },
};

export function isHomepageSectionKey(key: string): key is HomepageSectionKey {
  return homepageSectionKeys.includes(key as HomepageSectionKey);
}
