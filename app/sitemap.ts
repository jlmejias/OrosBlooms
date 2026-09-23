import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { listProducts } from "@/services/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProducts();
  const routes = ["", "/flores", "/bodas", "/eventos", "/personalizados", "/galeria", "/crear-regalo", "/combos", "/solicitar", "/informacion"];
  return [
    ...routes.map((path, index) => ({ url: absoluteUrl(path || "/"), changeFrequency: (index < 2 ? "weekly" : "monthly") as "weekly" | "monthly", priority: index === 0 ? 1 : index === 1 ? .9 : .7 })),
    ...products.map(product => ({ url: absoluteUrl(`/flores/${product.slug}`), changeFrequency: "weekly" as const, priority: .8, images: product.image ? [absoluteUrl(product.image)] : undefined })),
  ];
}
