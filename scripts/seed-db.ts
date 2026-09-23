import { eq, sql } from "drizzle-orm";
import { db, pool } from "../db/client";
import { categories, comboItems, combos, galleryImages, galleryItems, mediaAssets, productComplementRecommendations, productImages, products, productVariants, services, testimonials } from "../db/schema";

const categorySeeds = [
  { slug: "rosas", name: "Rosas", sortOrder: 0 },
  { slug: "girasoles", name: "Girasoles", sortOrder: 1 },
  { slug: "mixtos", name: "Arreglos mixtos", sortOrder: 2 },
  { slug: "bodas", name: "Bodas", sortOrder: 3 },
  { slug: "complementos", name: "Complementos", sortOrder: 4 },
  { slug: "personalizados", name: "Personalizados", sortOrder: 5 },
] as const;

const mediaSeeds = [
  { providerId: "seed/aurora", url: "/bouquet-editorial.png", alt: "Ramo en tonos rosados y crema" },
  { providerId: "seed/rosas", url: "/home-roses.webp", alt: "Ramo de rosas rojas" },
  { providerId: "seed/girasoles", url: "/home-sunflowers.webp", alt: "Ramo de girasoles amarillos" },
  { providerId: "seed/jardin", url: "/home-hero.webp", alt: "Arreglo floral rosado" },
  { providerId: "seed/boda", url: "/home-wedding.webp", alt: "Decoración floral de ceremonia" },
] as const;

async function main() {
  await db.transaction(async (tx) => {
    const categoryIds = new Map<string, string>();
    for (const item of categorySeeds) {
      const [row] = await tx.insert(categories).values(item).onConflictDoUpdate({ target: categories.slug, set: { name: item.name, sortOrder: item.sortOrder, updatedAt: sql`now()` } }).returning({ id: categories.id });
      categoryIds.set(item.slug, row.id);
    }

    const imageIds = new Map<string, string>();
    for (const item of mediaSeeds) {
      const [row] = await tx.insert(mediaAssets).values({ ...item, provider: "local" }).onConflictDoUpdate({ target: [mediaAssets.provider, mediaAssets.providerId], set: { url: item.url, alt: item.alt, updatedAt: sql`now()` } }).returning({ id: mediaAssets.id });
      imageIds.set(item.providerId, row.id);
    }

    const productSeeds = [
      { slug: "ramo-aurora", name: "Ramo Aurora", type: "floral", category: "mixtos", image: "seed/aurora", price: 28000, description: "Rosas suaves y flores de temporada" },
      { slug: "rosas-de-amor", name: "Rosas de Amor", type: "floral", category: "rosas", image: "seed/rosas", price: 30000, description: "Un gesto clásico que siempre emociona" },
      { slug: "luz-de-primavera", name: "Luz de Primavera", type: "floral", category: "girasoles", image: "seed/girasoles", price: 26000, description: "Color y calidez para celebrar" },
      { slug: "jardin-rosado", name: "Jardín Rosado", type: "floral", category: "mixtos", image: "seed/jardin", price: 32000, description: "Una composición delicada y natural" },
      { slug: "tarjeta-dedicatoria", name: "Tarjeta de dedicatoria", type: "complement", category: "complementos", image: null, price: 2500, description: "Tarjeta para acompañar un arreglo" },
      { slug: "chocolates-artesanales", name: "Chocolates artesanales", type: "complement", category: "complementos", image: null, price: 7500, description: "Caja de chocolates para acompañar el regalo" },
      { slug: "globo-celebracion", name: "Globo de celebración", type: "complement", category: "complementos", image: null, price: 4500, description: "Globo para cumpleaños y celebraciones" },
      { slug: "termo-personalizado", name: "Termo personalizado", type: "personalized", category: "personalizados", image: null, price: 12000, description: "Detalle personalizado de muestra" },
    ] as const;
    const productIds = new Map<string,string>();
    for (const item of productSeeds) {
      const [product] = await tx.insert(products).values({ slug: item.slug, name: item.name, type: item.type, categoryId: categoryIds.get(item.category), shortDescription: item.description, basePrice: item.price, priceLabel: "Desde", status: "active", featured: item.type === "floral", customizable: item.type === "personalized" }).onConflictDoUpdate({ target: products.slug, set: { name: item.name, type: item.type, categoryId: categoryIds.get(item.category), shortDescription: item.description, basePrice: item.price, status: "active", updatedAt: sql`now()` } }).returning({ id: products.id });
      productIds.set(item.slug,product.id);
      if (item.image) {
        const mediaAssetId = imageIds.get(item.image)!;
        await tx.insert(productImages).values({ productId: product.id, mediaAssetId, primary: true }).onConflictDoNothing({ target: [productImages.productId, productImages.mediaAssetId] });
      }
      const existingVariants = await tx.select({ id: productVariants.id }).from(productVariants).where(eq(productVariants.productId, product.id)).limit(1);
      if (existingVariants.length === 0) await tx.insert(productVariants).values({ productId: product.id, name: "Estándar", price: item.price });
    }
    for(const floralSlug of ["ramo-aurora","rosas-de-amor","luz-de-primavera","jardin-rosado"]){for(const[sortOrder,complementSlug]of["tarjeta-dedicatoria","chocolates-artesanales","globo-celebracion"].entries()){await tx.insert(productComplementRecommendations).values({floralProductId:productIds.get(floralSlug)!,complementProductId:productIds.get(complementSlug)!,sortOrder}).onConflictDoNothing();}}
    const[combo]=await tx.insert(combos).values({slug:"celebracion-luminosa",name:"Celebración luminosa",description:"Girasoles, chocolates y tarjeta para celebrar.",imageUrl:"/home-sunflowers.webp",price:36000,promotionalPrice:34000,featured:true,active:true}).onConflictDoUpdate({target:combos.slug,set:{name:"Celebración luminosa",description:"Girasoles, chocolates y tarjeta para celebrar.",imageUrl:"/home-sunflowers.webp",price:36000,promotionalPrice:34000,featured:true,active:true,updatedAt:sql`now()`}}).returning({id:combos.id});
    const existingComboItems=await tx.select({id:comboItems.id}).from(comboItems).where(eq(comboItems.comboId,combo.id)).limit(1);if(!existingComboItems.length)await tx.insert(comboItems).values(["luz-de-primavera","chocolates-artesanales","tarjeta-dedicatoria"].map(productSlug=>({comboId:combo.id,productId:productIds.get(productSlug)!})));

    for (const item of [
      { slug: "bodas", name: "Flores para bodas", type: "wedding", image: "seed/boda", sortOrder: 0 },
      { slug: "eventos", name: "Diseño floral para eventos", type: "event", image: "seed/jardin", sortOrder: 1 },
    ]) {
      await tx.insert(services).values({ slug: item.slug, name: item.name, type: item.type, imageId: imageIds.get(item.image), sortOrder: item.sortOrder }).onConflictDoUpdate({ target: services.slug, set: { name: item.name, type: item.type, imageId: imageIds.get(item.image), updatedAt: sql`now()` } });
    }
    const [gallery] = await tx.insert(galleryItems).values({ slug: "inspiracion-boda-rosada", title: "Inspiración para boda rosada", categoryId: categoryIds.get("bodas"), description: "Composición floral de muestra", featured: true }).onConflictDoUpdate({ target: galleryItems.slug, set: { title: "Inspiración para boda rosada", updatedAt: sql`now()` } }).returning({ id: galleryItems.id });
    await tx.insert(galleryImages).values({ galleryItemId: gallery.id, mediaAssetId: imageIds.get("seed/boda")! }).onConflictDoNothing({ target: [galleryImages.galleryItemId, galleryImages.mediaAssetId] });

    // El testimonio ficticio permanece sin aprobar para que nunca aparezca como reseña real.
    const existing = await tx.select({ id: testimonials.id }).from(testimonials).where(eq(testimonials.displayName, "Ejemplo ficticio")).limit(1);
    if (existing.length === 0) await tx.insert(testimonials).values({ displayName: "Ejemplo ficticio", quote: "Testimonio de muestra para probar el esquema.", approved: false });
  });
  process.stdout.write("Seed de desarrollo aplicado.\n");
}

main().catch((error: unknown) => { process.stderr.write(`${error instanceof Error ? error.message : "Error de seed"}\n`); process.exitCode = 1; }).finally(() => pool.end());
