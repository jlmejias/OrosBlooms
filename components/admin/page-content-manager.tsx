"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Modal, Upload } from "antd";
import type { UploadProps } from "antd";
import { CheckOutlined, DeleteOutlined, EditOutlined, EyeOutlined, LinkOutlined, PictureOutlined, UploadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { savePageLayoutContent } from "@/app/admin/page-layout-actions";
import { defaultPageContent, pageFeatureIconOptions, type PageContent, type PageImage, type PageSlug } from "@/lib/service-page";
import { AdminFormGrid, AdminFormSection } from "./admin-form-section";
import { DraggableModal } from "./draggable-modal";
import { ValidatedAdminForm } from "./validated-admin-form";

type EditablePage = PageContent & { images?: PageImage[] };
type PendingPageImage = { id: string; file: File; preview: string };
const pages: Array<{ key: PageSlug; label: string; path: string; description: string; fallbackImage: string }> = [
  { key: "bodas", label: "Bodas", path: "/bodas", description: "Encabezado, propuesta editorial, beneficios e imágenes de bodas.", fallbackImage: "/home-wedding.webp" },
  { key: "eventos", label: "Eventos", path: "/eventos", description: "Encabezado, composición editorial, servicios e imagen de eventos.", fallbackImage: "/home-sunflowers.webp" },
  { key: "personalizados", label: "Personalizados", path: "/personalizados", description: "Encabezado, bloque blush, tarjetas de complementos e imágenes.", fallbackImage: "/home-hero.webp" },
];

export function PageContentManager({ content }: { content: Partial<Record<PageSlug, EditablePage>> }) {
  const router = useRouter();
  const [editing, setEditing] = useState<PageSlug | null>(null);
  const selected = pages.find(page => page.key === editing);
  return <><section className="admin-page-content-list">{pages.map(page => { const value={...defaultPageContent(page.key),...content[page.key]}; const image=value.images?.[0]?.url??page.fallbackImage; const imageCount=value.images?.length??0; return <article key={page.key} className="admin-page-card"><div className="admin-page-card-image"><Image src={image} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" unoptimized/><Link href={page.path} target="_blank" className="admin-page-preview"><EyeOutlined/> Vista previa ↗</Link></div><div className="admin-page-card-content"><span className="admin-page-status"><CheckOutlined/> Publicada</span><h2>{page.label}</h2><p className="admin-page-path"><LinkOutlined/> orosblooms.com{page.path}</p><p className="admin-page-description">{page.description}</p><div className="admin-page-meta"><span>ES <CheckOutlined/></span><span>EN <CheckOutlined/></span><span><PictureOutlined/> {imageCount || 1} {imageCount === 1 ? "imagen" : "imágenes"}</span></div><Button type="primary" block icon={<EditOutlined/>} onClick={() => setEditing(page.key)}>Editar página →</Button><Link href={page.path} target="_blank" className="admin-page-public-link">Ver página pública ↗</Link></div></article>; })}</section><Modal className="admin-standard-modal" title={<div className="admin-modal-title"><strong>{selected?.label}</strong><span>Edita el contenido público y la composición editorial en español e inglés.</span></div>} open={Boolean(editing)} onCancel={() => setEditing(null)} footer={null} destroyOnHidden width={1160} centered modalRender={modal => <DraggableModal>{modal}</DraggableModal>}>{editing && <PageContentForm key={editing} pageKey={editing} value={{ ...defaultPageContent(editing), ...content[editing] }} onSuccess={() => { setEditing(null); router.refresh(); }}/>}</Modal></>;
}

function PageContentForm({ pageKey, value, onSuccess }: { pageKey: PageSlug; value: EditablePage; onSuccess: () => void }) {
  const maxImages = pageKey === "personalizados" ? 5 : 24;
  const [gallery, setGallery] = useState<PageImage[]>(value.images ?? []);
  const [pendingImages, setPendingImages] = useState<PendingPageImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(value.images?.[0]?.id ?? null);
  const previewUrls = useRef<string[]>([]);
  const imageCount = useRef(value.images?.length ?? 0);
  const pendingCount = useRef(0);
  const [imageError, setImageError] = useState("");
  useEffect(() => () => previewUrls.current.forEach(URL.revokeObjectURL), []);
  const beforeUpload: UploadProps["beforeUpload"] = file => {
    const image=file as File;
    if(!["image/jpeg","image/png","image/webp"].includes(image.type) || image.size>12_000_000){setImageError("Usa imágenes JPG, PNG o WebP de máximo 12 MB cada una.");return Upload.LIST_IGNORE;}
    if(imageCount.current>=maxImages){setImageError(`Esta página admite hasta ${maxImages} imágenes. Elimina una para agregar otra.`);return Upload.LIST_IGNORE;}
    if(pendingCount.current>=5){setImageError("Puedes agregar hasta 5 imágenes por guardado. Guarda y vuelve a abrir la página para añadir más.");return Upload.LIST_IGNORE;}
    imageCount.current+=1;
    pendingCount.current+=1;
    setImageError("");
    const pending={id:`new-${Date.now()}-${Math.random().toString(36).slice(2)}`,file:image,preview:URL.createObjectURL(image)};
    previewUrls.current.push(pending.preview);
    setPendingImages(current=>[...current,pending]);
    setActiveImageId(pending.id);
    return Upload.LIST_IGNORE;
  };
  const moveImage = (index: number, direction: -1 | 1) => setGallery(current => { const next=[...current]; const target=index+direction; if(target<0 || target>=next.length)return current; [next[index],next[target]]=[next[target],next[index]]; return next; });
  const imageItems=[...gallery.map((image,index)=>({id:image.id,url:image.url,label:imageRole(pageKey,index),kind:"saved" as const,index})),...pendingImages.map((image,index)=>({id:image.id,url:image.preview,label:imageRole(pageKey,gallery.length+index),kind:"pending" as const,index}))];
  const activeImage=imageItems.find(image=>image.id===activeImageId)??imageItems[0];
  const removeActiveImage=(event:React.MouseEvent<HTMLButtonElement>)=>{event.preventDefault();event.stopPropagation();if(!activeImage)return;imageCount.current-=1;setImageError("");if(activeImage.kind==="saved"){const next=gallery.filter(image=>image.id!==activeImage.id);setGallery(next);setActiveImageId(next[0]?.id??pendingImages[0]?.id??null);return;}pendingCount.current-=1;const pending=pendingImages.find(image=>image.id===activeImage.id);if(pending){URL.revokeObjectURL(pending.preview);previewUrls.current=previewUrls.current.filter(url=>url!==pending.preview);}const next=pendingImages.filter(image=>image.id!==activeImage.id);setPendingImages(next);setActiveImageId(gallery[0]?.id??next[0]?.id??null);};
  const moveActiveImage=(direction:-1|1)=>{if(!activeImage)return;const images=activeImage.kind==="saved"?gallery:pendingImages;const target=activeImage.index+direction;if(target<0||target>=images.length)return;if(activeImage.kind==="saved")moveImage(activeImage.index,direction);else setPendingImages(current=>{const next=[...current];[next[activeImage.index],next[target]]=[next[target],next[activeImage.index]];return next;});setActiveImageId(images[activeImage.index].id);};
  const showsHeroAside = pageKey === "personalizados";
  const required = ["kickerEs","kickerEn","titleEs","titleEn","descriptionEs","descriptionEn",...(showsHeroAside?["heroAsideEs","heroAsideEn"]:[]),"detailKickerEs","detailKickerEn","detailTitleEs","detailTitleEn","detailBodyOneEs","detailBodyOneEn","ctaLabelEs","ctaLabelEn","imageAltEs","imageAltEn",...[0,1,2].flatMap(index=>[`feature${index}TitleEs`,`feature${index}TitleEn`,`feature${index}DescriptionEs`,`feature${index}DescriptionEn`])];
  return <ValidatedAdminForm action={savePageLayoutContent} className="admin-form product-form page-content-form" required={required} submitLabel="Guardar y publicar" encType="multipart/form-data" onSuccess={onSuccess} prepareFormData={formData => { formData.set("galleryImages", JSON.stringify(gallery)); pendingImages.forEach(image => formData.append("imageFiles", image.file)); return formData; }}>
    <input type="hidden" name="pageKey" value={pageKey}/>
    <AdminFormSection number="1" title="Encabezado" text="Contenido principal y texto editorial corto sobre la fotografía de portada."><AdminFormGrid>
      <label><span>Etiqueta en español</span><input name="kickerEs" defaultValue={value.kickerEs}/></label><label><span>Etiqueta en inglés</span><input name="kickerEn" defaultValue={value.kickerEn}/></label>
      <label><span>Título en español</span><input name="titleEs" defaultValue={value.titleEs}/></label><label><span>Título en inglés</span><input name="titleEn" defaultValue={value.titleEn}/></label>
      <label><span>Descripción en español</span><textarea name="descriptionEs" defaultValue={value.descriptionEs} maxLength={2000}/></label><label><span>Descripción en inglés</span><textarea name="descriptionEn" defaultValue={value.descriptionEn} maxLength={2000}/></label>
      {showsHeroAside?<><label><span>Frase destacada en español</span><input name="heroAsideEs" defaultValue={value.heroAsideEs}/></label><label><span>Frase destacada en inglés</span><input name="heroAsideEn" defaultValue={value.heroAsideEn}/></label></>:<><input type="hidden" name="heroAsideEs" value={value.heroAsideEs}/><input type="hidden" name="heroAsideEn" value={value.heroAsideEn}/></>}
    </AdminFormGrid></AdminFormSection>
    <AdminFormSection number="2" title="Bloque editorial y acciones" text="Contenido del bloque principal y su CTA de la página."><AdminFormGrid>
      <label><span>Etiqueta editorial en español</span><input name="detailKickerEs" defaultValue={value.detailKickerEs}/></label><label><span>Etiqueta editorial en inglés</span><input name="detailKickerEn" defaultValue={value.detailKickerEn}/></label>
      <label><span>Título secundario en español</span><input name="detailTitleEs" defaultValue={value.detailTitleEs}/></label><label><span>Título secundario en inglés</span><input name="detailTitleEn" defaultValue={value.detailTitleEn}/></label>
      <label><span>Primer párrafo en español</span><textarea name="detailBodyOneEs" defaultValue={value.detailBodyOneEs} maxLength={2000}/></label><label><span>Primer párrafo en inglés</span><textarea name="detailBodyOneEn" defaultValue={value.detailBodyOneEn} maxLength={2000}/></label>
      <label><span>Segundo párrafo en español</span><textarea name="detailBodyTwoEs" defaultValue={value.detailBodyTwoEs} maxLength={2000}/></label><label><span>Segundo párrafo en inglés</span><textarea name="detailBodyTwoEn" defaultValue={value.detailBodyTwoEn} maxLength={2000}/></label>
      <label><span>CTA principal en español</span><input name="ctaLabelEs" defaultValue={value.ctaLabelEs}/></label><label><span>CTA principal en inglés</span><input name="ctaLabelEn" defaultValue={value.ctaLabelEn}/></label>
      <input type="hidden" name="secondaryCtaLabelEs" value={value.secondaryCtaLabelEs}/><input type="hidden" name="secondaryCtaLabelEn" value={value.secondaryCtaLabelEn}/>
    </AdminFormGrid></AdminFormSection>
    <AdminFormSection number="3" title="Tres puntos destacados" text="Bodas y Eventos los muestran como beneficios. Personalizados los muestra como tarjetas con fotografía."><AdminFormGrid>{[0,1,2].flatMap(index=>{ const feature=value.features[index]; return [<label key={`icon-${index}`}><span>Punto {index+1}: icono</span><select name={`feature${index}Icon`} defaultValue={feature.icon}>{pageFeatureIconOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>,<div key={`spacer-${index}`} className="admin-page-feature-spacer" aria-hidden="true"/>,<label key={`title-es-${index}`}><span>Punto {index+1}: título en español</span><input name={`feature${index}TitleEs`} defaultValue={feature.titleEs}/></label>,<label key={`title-en-${index}`}><span>Punto {index+1}: título en inglés</span><input name={`feature${index}TitleEn`} defaultValue={feature.titleEn}/></label>,<label key={`description-es-${index}`}><span>Punto {index+1}: descripción en español</span><textarea name={`feature${index}DescriptionEs`} defaultValue={feature.descriptionEs} maxLength={300}/></label>,<label key={`description-en-${index}`}><span>Punto {index+1}: descripción en inglés</span><textarea name={`feature${index}DescriptionEn`} defaultValue={feature.descriptionEn} maxLength={300}/></label>]; })}</AdminFormGrid></AdminFormSection>
    <AdminFormSection number="4" title="Imágenes de la página" text={pageKey==="personalizados"?"Agrega hasta 5 imágenes para la composición.":"Las primeras imágenes forman la portada; las siguientes aparecen en la galería pública. Puedes agregar hasta 24."}>
      {activeImage&&<div className="page-image-preview"><Image src={activeImage.url} alt={activeImage.label} fill sizes="360px" style={{objectFit:"cover"}} unoptimized/></div>}
      <div className="page-image-thumbnails" aria-label="Imágenes de la página">{Array.from({length:Math.max(pageKey==="personalizados"?5:Math.min(maxImages,imageItems.length+1),imageItems.length)},(_,index)=>{const image=imageItems[index];return image?<button key={image.id} type="button" className={image.id===activeImage?.id?"is-selected":""} onClick={()=>setActiveImageId(image.id)} aria-label={image.label}><Image src={image.url} alt="" fill sizes="72px" style={{objectFit:"cover"}} unoptimized/><span>{index+1}</span></button>:<span key={`empty-${index}`} className="page-image-empty-slot" aria-label={`Espacio ${index+1} disponible`}>{index+1}</span>;})}</div>
      {activeImage&&<div className="page-image-controls"><p>{activeImage.label}</p><div><button type="button" onClick={()=>moveActiveImage(-1)} disabled={activeImage.index===0}>← Subir</button><button type="button" onClick={()=>moveActiveImage(1)} disabled={activeImage.index===(activeImage.kind==="saved"?gallery.length:pendingImages.length)-1}>Bajar →</button><button type="button" onClick={removeActiveImage}><DeleteOutlined/> Eliminar</button></div></div>}
      {imageItems.length<maxImages&&pendingImages.length<5&&<Upload.Dragger className="product-image-dropzone page-image-add" accept="image/jpeg,image/png,image/webp" multiple showUploadList={false} beforeUpload={beforeUpload}><UploadOutlined/><strong>Agregar imágenes</strong><span>Arrastra aquí o haz clic para seleccionar varias</span><small>JPG, PNG o WebP. Máximo 12 MB por imagen y 5 nuevas por guardado.</small></Upload.Dragger>}
      <p className="page-image-count">{imageItems.length} de {maxImages} imágenes{pendingImages.length===5&&imageItems.length<maxImages?" · Guarda y vuelve a abrir para agregar más.":""}</p>
      {imageError&&<p className="page-image-error" role="alert">{imageError}</p>}
      <AdminFormGrid><label><span>Texto alternativo en español</span><input name="imageAltEs" defaultValue={value.imageAltEs}/></label><label><span>Texto alternativo en inglés</span><input name="imageAltEn" defaultValue={value.imageAltEn}/></label></AdminFormGrid>
    </AdminFormSection>
  </ValidatedAdminForm>;
}

function imageRole(pageKey: PageSlug, index: number) {
  if(index===0)return "Imagen 1 · portada principal";
  if(pageKey==="bodas"&&index===1)return "Imagen 2 · bloque editorial";
  if(pageKey==="personalizados"&&index===1)return "Imagen 2 · imagen auxiliar del encabezado";
  if(pageKey==="personalizados"&&index<5)return `Imagen ${index+1} · tarjeta ${index-1}`;
  return `Imagen ${index+1} · galería`;
}
