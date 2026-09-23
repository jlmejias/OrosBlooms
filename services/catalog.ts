import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { categories, comboItems, combos, mediaAssets, productComplementRecommendations, productImages, products, productVariants, services } from "@/db/schema";

export type CatalogProduct = Awaited<ReturnType<typeof listProducts>>[number];

export async function listCategories() {
  return db.select().from(categories).where(eq(categories.visible, true)).orderBy(asc(categories.sortOrder));
}

export async function listProducts(filters: { category?: string; query?: string; sort?: string; type?: "floral" | "complement" | "personalized" } = {}) {
  const conditions = [eq(products.status, "active"), eq(products.type, filters.type ?? "floral")];
  if (filters.category) conditions.push(eq(categories.slug, filters.category));
  if (filters.query) conditions.push(or(ilike(products.name, `%${filters.query}%`), ilike(products.shortDescription, `%${filters.query}%`))!);
  const order = filters.sort === "precio-asc" ? asc(products.basePrice) : filters.sort === "precio-desc" ? desc(products.basePrice) : filters.sort === "nombre" ? asc(products.name) : desc(products.featured);
  return db.select({ id: products.id, name: products.name, slug: products.slug, shortDescription: products.shortDescription, basePrice: products.basePrice, priceLabel: products.priceLabel, featured: products.featured, category: categories.name, categorySlug: categories.slug, image: mediaAssets.url, imageAlt: mediaAssets.alt })
    .from(products).leftJoin(categories, eq(products.categoryId, categories.id)).leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.primary, true))).leftJoin(mediaAssets, eq(productImages.mediaAssetId, mediaAssets.id)).where(and(...conditions)).orderBy(order, asc(products.name));
}

export async function getProduct(slug: string) {
  const [product] = await db.select({ id: products.id, name: products.name, slug: products.slug, shortDescription: products.shortDescription, description: products.description, basePrice: products.basePrice, priceLabel: products.priceLabel, customizable: products.customizable, category: categories.name, image: mediaAssets.url, imageAlt: mediaAssets.alt })
    .from(products).leftJoin(categories, eq(products.categoryId, categories.id)).leftJoin(productImages, and(eq(productImages.productId, products.id), eq(productImages.primary, true))).leftJoin(mediaAssets, eq(productImages.mediaAssetId, mediaAssets.id)).where(and(eq(products.slug, slug), eq(products.status, "active"), eq(products.type, "floral"))).limit(1);
  if (!product) return null;
  const variants = await db.select().from(productVariants).where(and(eq(productVariants.productId, product.id), eq(productVariants.available, true))).orderBy(asc(productVariants.sortOrder));
  const recommendationRows = await db.select({ id: productComplementRecommendations.complementProductId }).from(productComplementRecommendations).where(and(eq(productComplementRecommendations.floralProductId, product.id), eq(productComplementRecommendations.active, true))).orderBy(asc(productComplementRecommendations.sortOrder));
  const availableComplements = await listProducts({ type: "complement" });
  const complementById = new Map(availableComplements.map(item => [item.id, item]));
  const complements = recommendationRows.map(item => complementById.get(item.id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return { ...product, variants, complements };
}

export async function listCombos() {
  const now = new Date();
  const activeCombos = await db.select().from(combos).where(and(eq(combos.active, true), or(sql`${combos.startsAt} IS NULL`, sql`${combos.startsAt} <= ${now}`), or(sql`${combos.endsAt} IS NULL`, sql`${combos.endsAt} >= ${now}`))).orderBy(desc(combos.featured), asc(combos.name));
  return Promise.all(activeCombos.map(async combo => ({ ...combo, items: await db.select({ productId: comboItems.productId, quantity: comboItems.quantity, name: products.name }).from(comboItems).innerJoin(products, eq(comboItems.productId, products.id)).where(eq(comboItems.comboId, combo.id)) })));
}

export async function listGiftProducts() {
  const flowers = await listProducts();
  return Promise.all(flowers.map(async product => ({ ...product, variants: await db.select({ id: productVariants.id, name: productVariants.name, price: productVariants.price }).from(productVariants).where(and(eq(productVariants.productId, product.id), eq(productVariants.available, true))).orderBy(asc(productVariants.sortOrder)) })));
}

export async function searchSite(query: string) {
  if (!query.trim()) return { products: [], categories: [], services: [] };
  const term = `%${query.trim()}%`;
  const [foundProducts, foundCategories, foundServices] = await Promise.all([
    db.select({ name: products.name, slug: products.slug, description: products.shortDescription }).from(products).where(and(eq(products.status, "active"), or(ilike(products.name, term), ilike(products.shortDescription, term)))).limit(12),
    db.select({ name: categories.name, slug: categories.slug, description: categories.description }).from(categories).where(and(eq(categories.visible, true), or(ilike(categories.name, term), ilike(categories.description, term)))).limit(8),
    db.select({ name: services.name, slug: services.slug, description: services.description }).from(services).where(and(eq(services.visible, true), or(ilike(services.name, term), ilike(services.description, term)))).limit(8),
  ]);
  return { products: foundProducts, categories: foundCategories, services: foundServices };
}

export async function catalogStats() {
  const [row] = await db.select({ products: sql<number>`count(*) filter (where ${products.status} = 'active')::int` }).from(products);
  return row;
}
