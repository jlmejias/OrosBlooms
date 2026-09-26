import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/flores", "/bodas", "/eventos", "/personalizados", "/galeria", "/crear-regalo", "/combos", "/solicitar", "/informacion"];
  return [
    ...routes.map((path, index) => ({ url: absoluteUrl(path || "/"), changeFrequency: (index < 2 ? "weekly" : "monthly") as "weekly" | "monthly", priority: index === 0 ? 1 : index === 1 ? .9 : .7 })),
  ];
}
