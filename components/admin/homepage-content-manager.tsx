"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckOutlined, EditOutlined, EyeOutlined, HomeOutlined, PictureOutlined } from "@ant-design/icons";
import { homepageSectionDefaults, type HomepageSectionKey } from "@/lib/homepage";

type Section = { key: HomepageSectionKey; visible: boolean; content?: Record<string, unknown> };
const details: Record<HomepageSectionKey, string> = {
  categories: "6 categorías destacadas",
  featuredEditorial: "Productos seleccionados",
  giftAddons: "Ositos, chocolates y tarjetas",
  story: "Bloque editorial",
};

export function HomepageContentManager({ sections }: { sections: Section[] }) {
  return <section className="admin-page-content-list">{sections.map(section=>{const fallback=homepageSectionDefaults[section.key];const content=section.content as { titleEs?: string; images?: string[] } | undefined;const images=content?.images?.length?content.images:fallback.images;const image=images[0];return <article key={section.key} className="admin-page-card"><div className="admin-page-card-image"><Image src={image} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" unoptimized/><Link href="/" target="_blank" className="admin-page-preview"><EyeOutlined/> Vista previa ↗</Link></div><div className="admin-page-card-content"><span className={`admin-page-status${section.visible?"":" is-hidden"}`}><CheckOutlined/> {section.visible?"Visible":"Oculta"}</span><h2>{fallback.label}</h2><p className="admin-page-path"><HomeOutlined/> Bloque de inicio</p><p className="admin-page-description">{content?.titleEs || fallback.titleEs}</p><div className="admin-page-meta"><span>ES <CheckOutlined/></span><span>EN <CheckOutlined/></span><span><PictureOutlined/> {images.length} {images.length===1?"imagen":"imágenes"}</span></div><Link className="admin-home-card-edit" href={`/admin/inicio?edit=${section.key}`}><EditOutlined/> Editar bloque →</Link><Link href="/" target="_blank" className="admin-page-public-link">Ver página de inicio ↗</Link><small className="admin-home-card-detail">{details[section.key]}</small></div></article>;})}</section>;
}
