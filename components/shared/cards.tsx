import Image from "next/image";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";

const editorialImage = "/bouquet-editorial.png";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface", className)} {...props} />;
}

export function ImageCard({ image = editorialImage, alt, ratio = "portrait", children, className }: { image?: string; alt: string; ratio?: "portrait" | "landscape" | "square"; children?: ReactNode; className?: string }) {
  const aspect = { portrait: "aspect-[4/5]", landscape: "aspect-[3/2]", square: "aspect-square" }[ratio];
  return <div className={cn("relative overflow-hidden rounded-[var(--radius-card)] bg-cream", aspect, className)}>
    <Image src={image} alt={alt} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 33vw" className="object-cover" />
    {children}
  </div>;
}

export function ProductCard({ name, description, price, image = editorialImage, alt, badge }: { name: string; description: string; price: string; image?: string; alt: string; badge?: string }) {
  return <Card className="flex h-full flex-col p-2 sm:p-3">
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream sm:aspect-[4/4.6]">
      <Image src={image} alt={alt} fill sizes="(max-width: 640px) 48vw, (max-width: 1024px) 35vw, 24vw" className="object-cover" />
      {badge && <Badge tone="floral" className="absolute left-2 top-2 sm:left-3 sm:top-3">{badge}</Badge>}
    </div>
    <div className="flex flex-1 flex-col px-2 pb-2 pt-3 sm:px-2 sm:pt-4">
      <h3 className="text-sm font-semibold leading-snug sm:text-base">{name}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-muted sm:text-sm">{description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
        <span className="text-sm font-semibold sm:text-base">{price}</span>
        <Button variant="secondary" size="compact" className="w-full sm:w-auto">Ver diseño</Button>
      </div>
    </div>
  </Card>;
}

export function CategoryCard({ name, image = editorialImage, alt }: { name: string; image?: string; alt: string }) {
  return <Card className="group relative aspect-[4/5] border-0 bg-cream">
    <Image src={image} alt={alt} fill sizes="(max-width: 640px) 44vw, (max-width: 1024px) 32vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-4 pb-4 pt-12 text-white"><h3 className="font-serif text-2xl leading-none sm:text-3xl">{name}</h3></div>
  </Card>;
}

export function GalleryCard({ title, detail, image = editorialImage, alt, className }: { title: string; detail: string; image?: string; alt: string; className?: string }) {
  return <Card className={className}>
    <div className="relative aspect-[3/2] bg-cream"><Image src={image} alt={alt} fill sizes="(max-width: 640px) 90vw, 50vw" className="object-cover" /></div>
    <div className="p-5"><p className="type-caption text-olive">{detail}</p><h3 className="type-h3 mt-2">{title}</h3></div>
  </Card>;
}
