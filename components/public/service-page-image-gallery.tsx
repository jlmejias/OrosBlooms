"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PageImage } from "@/lib/service-page";

export function ServicePageImageGallery({ images, alt, locale }: { images: PageImage[]; alt: string; locale: "es" | "en" }) {
  const [selected, setSelected] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const es = locale === "es";

  useEffect(() => {
    if (selected === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
        trigger.current?.focus();
      }
      if (event.key === "ArrowRight") setSelected(index => index === null ? null : (index + 1) % images.length);
      if (event.key === "ArrowLeft") setSelected(index => index === null ? null : (index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, images.length]);

  if (!images.length) return null;
  const move = (direction: number) => setSelected(index => index === null ? null : (index + direction + images.length) % images.length);
  const close = () => { setSelected(null); trigger.current?.focus(); };

  return <section className="service-page-image-gallery" aria-label={es ? "Galería de fotos" : "Photo gallery"}>
    <header className="service-page-image-gallery-heading"><div><p className="commerce-kicker">OrosBlooms</p><h2>{es ? "Galería" : "Gallery"}</h2></div><span>{images.length} {es ? "fotografías" : "photos"}</span></header>
    <div className="service-page-image-gallery-grid">{images.map((image, index) => <button key={image.id} type="button" className="service-page-image-gallery-item" aria-label={`${es ? "Ver foto" : "View photo"} ${index + 1}`} onClick={event => { trigger.current = event.currentTarget; setSelected(index); }}><Image src={image.url} alt={`${alt} ${index + 1}`} fill sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"/><span>{String(index + 1).padStart(2, "0")}</span></button>)}</div>
    {selected !== null && <div className="service-page-gallery-lightbox" role="dialog" aria-modal="true" aria-label={es ? "Foto ampliada" : "Enlarged photo"} onTouchStart={event => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={event => { if (touchStart.current === null) return; const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current; if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1); touchStart.current = null; }}>
      <button type="button" className="service-page-gallery-backdrop" aria-label={es ? "Cerrar galería" : "Close gallery"} onClick={close}/>
      <div className="service-page-gallery-lightbox-content"><Image src={images[selected].url} alt={`${alt} ${selected + 1}`} fill sizes="100vw" priority/><button type="button" className="service-page-gallery-close" aria-label={es ? "Cerrar galería" : "Close gallery"} onClick={close} autoFocus>×</button>{images.length > 1 && <><button type="button" className="service-page-gallery-arrow is-previous" aria-label={es ? "Foto anterior" : "Previous photo"} onClick={() => move(-1)}>‹</button><button type="button" className="service-page-gallery-arrow is-next" aria-label={es ? "Foto siguiente" : "Next photo"} onClick={() => move(1)}>›</button></>}<span className="service-page-gallery-counter">{selected + 1} / {images.length}</span></div>
    </div>}
  </section>;
}
