export const categories = [
  { title: "Ramos de novia", image: "/bouquet-editorial.png", alt: "Ramo de novia en tonos rosados y crema", target: "bodas" },
  { title: "Cumpleaños", image: "/home-sunflowers.webp", alt: "Ramo de girasoles amarillos", target: "flores" },
  { title: "Amor y aniversario", image: "/home-roses.webp", alt: "Ramo de rosas rojas", target: "flores" },
  { title: "Eventos", image: "/home-wedding.webp", alt: "Decoración floral para ceremonia", target: "eventos" },
  { title: "Condolencias", image: "/bouquet-editorial.png", alt: "Arreglo floral en tonos suaves", target: "flores" },
  { title: "Personalizados", image: "/home-hero.webp", alt: "Rosas rosadas y flores blancas", target: "personalizados" },
] as const;

export const featuredProducts = [
  { name: "Ramo Aurora", description: "Rosas suaves y flores de temporada", price: "Desde ₡28.000", image: "/bouquet-editorial.png", alt: "Ramo en tonos rosados y crema" },
  { name: "Rosas de Amor", description: "Un gesto clásico que siempre emociona", price: "Desde ₡30.000", image: "/home-roses.webp", alt: "Ramo de rosas rojas" },
  { name: "Luz de Primavera", description: "Color y calidez para celebrar", price: "Desde ₡26.000", image: "/home-sunflowers.webp", alt: "Ramo de girasoles amarillos" },
  { name: "Jardín Rosado", description: "Una composición delicada y natural", price: "Desde ₡32.000", image: "/home-hero.webp", alt: "Ramo de rosas y peonías rosadas" },
] as const;

export const editorialFeaturedProducts = [
  { nameEs: "Jardín Rosado", nameEn: "Blush Garden", descriptionEs: "Rosas y flores de temporada", descriptionEn: "Roses and seasonal flowers", price: "$72", image: "/home-hero.webp", altEs: "Arreglo de rosas rosadas", altEn: "Blush rose arrangement" },
  { nameEs: "Luz de Primavera", nameEn: "Spring Light", descriptionEs: "Girasoles y follaje verde", descriptionEn: "Sunflowers and fresh greenery", price: "$58", image: "/home-sunflowers.webp", altEs: "Ramo de girasoles", altEn: "Sunflower bouquet" },
  { nameEs: "Dulce Amor", nameEn: "Sweet Love", descriptionEs: "Rosas, opción de osito y chocolates", descriptionEn: "Roses with optional teddy bear and chocolates", price: "$85", image: "/home-roses.webp", altEs: "Ramo de rosas rojas", altEn: "Red rose bouquet" },
  { nameEs: "Ramo Aurora", nameEn: "Aurora Bouquet", descriptionEs: "Lirios y flores premium", descriptionEn: "Lilies and premium flowers", price: "$65", image: "/bouquet-editorial.png", altEs: "Ramo floral en tonos crema", altEn: "Cream-toned floral bouquet" },
] as const;
