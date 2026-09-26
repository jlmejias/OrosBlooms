"use client";

import Image from "next/image";
import { useState } from "react";
import { FavoriteButton } from "./store-actions";

type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({ images, fallback, slug, locale }: { images: GalleryImage[]; fallback: string; slug: string; locale: "es" | "en" }) {
  const gallery = images.length ? images : [{ url: fallback, alt: null }];
  const [selected, setSelected] = useState(0);
  const image = gallery[selected] ?? gallery[0];
  return <div className="detail-gallery"><div className="detail-image"><Image src={image.url} alt={image.alt ?? "Imagen del producto"} fill priority sizes="(max-width:900px) 100vw,55vw"/><FavoriteButton slug={slug} locale={locale}/></div>{gallery.length > 1 && <div className="detail-thumbnails">{gallery.map((item, index) => <button key={`${item.url}-${index}`} type="button" className={index === selected ? "is-selected" : ""} onClick={() => setSelected(index)} aria-label={`Ver imagen ${index + 1}`}><Image src={item.url} alt="" fill sizes="96px"/></button>)}</div>}</div>;
}
