"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Modal, Upload } from "antd";
import type { UploadProps } from "antd";
import { CheckOutlined, EditOutlined, EyeOutlined, LinkOutlined, PictureOutlined, UploadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { savePageContent } from "@/app/admin/actions";
import { defaultPageContent, type PageContent, type PageImage, type PageSlug } from "@/lib/service-page";
import { AdminFormGrid, AdminFormSection } from "./admin-form-section";
import { DraggableModal } from "./draggable-modal";
import { ValidatedAdminForm } from "./validated-admin-form";

type EditablePage = PageContent & { images?: PageImage[] };
const pages: Array<{ key: PageSlug; label: string; path: string; description: string; fallbackImage: string }> = [
  { key: "bodas", label: "Bodas", path: "/bodas", description: "Encabezado, bloque editorial, galería y contenido para bodas.", fallbackImage: "/home-wedding.webp" },
  { key: "eventos", label: "Eventos", path: "/eventos", description: "Encabezado, bloque editorial, galería y contenido para eventos.", fallbackImage: "/home-sunflowers.webp" },
  { key: "personalizados", label: "Personalizados", path: "/personalizados", description: "Encabezado y bloque de detalles personalizados.", fallbackImage: "/home-hero.webp" },
];

export function PageContentManager({ content }: { content: Partial<Record<PageSlug, EditablePage>> }) {
  const router = useRouter();
  const [editing, setEditing] = useState<PageSlug | null>(null);
  const selected = pages.find(page => page.key === editing);
  return <><section className="admin-page-content-list">{pages.map(page => {const value={...defaultPageContent(page.key),...content[page.key]};const image=value.images?.[0]?.url??page.fallbackImage;const imageCount=value.images?.length??0;return <article key={page.key} className="admin-page-card"><div className="admin-page-card-image"><Image src={image} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" unoptimized/><Link href={page.path} target="_blank" className="admin-page-preview"><EyeOutlined/> Vista previa ↗</Link></div><div className="admin-page-card-content"><span className="admin-page-status"><CheckOutlined/> Publicada</span><h2>{page.label}</h2><p className="admin-page-path"><LinkOutlined/> orosblooms.com{page.path}</p><p className="admin-page-description">{page.description}</p><div className="admin-page-meta"><span>ES <CheckOutlined/></span><span>EN <CheckOutlined/></span><span><PictureOutlined/> {imageCount || 1} {imageCount === 1 ? "imagen" : "imágenes"}</span></div><Button type="primary" block icon={<EditOutlined/>} onClick={() => setEditing(page.key)}>Editar página →</Button><Link href={page.path} target="_blank" className="admin-page-public-link">Ver página pública ↗</Link></div></article>;})}</section><Modal className="admin-standard-modal" title={<div className="admin-modal-title"><strong>{selected?.label}</strong><span>Edita el contenido público en español e inglés.</span></div>} open={Boolean(editing)} onCancel={() => setEditing(null)} footer={null} destroyOnHidden width={920} centered modalRender={modal => <DraggableModal>{modal}</DraggableModal>}>{editing && <PageContentForm key={editing} pageKey={editing} value={{ ...defaultPageContent(editing), ...content[editing] }} onSuccess={() => { setEditing(null); router.refresh(); }}/>}</Modal></>;
}

function PageContentForm({ pageKey, value, onSuccess }: { pageKey: PageSlug; value: EditablePage; onSuccess: () => void }) {
  const [gallery, setGallery] = useState<PageImage[]>(value.images ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const beforeUpload: UploadProps["beforeUpload"] = file => { const image=file as File; if(!["image/jpeg", "image/png", "image/webp"].includes(image.type) || image.size>12_000_000)return Upload.LIST_IGNORE; setNewFiles(current => current.some(item => item.name===image.name && item.size===image.size) ? current : [...current,image]); return Upload.LIST_IGNORE; };
  const moveImage = (index: number, direction: -1 | 1) => setGallery(current => { const next=[...current]; const target=index+direction; if(target<0 || target>=next.length)return current; [next[index],next[target]]=[next[target],next[index]]; return next; });
  return <ValidatedAdminForm action={savePageContent} required={["kickerEs", "kickerEn", "titleEs", "titleEn", "descriptionEs", "descriptionEn", "detailTitleEs", "detailTitleEn", "detailBodyOneEs", "detailBodyOneEn", "ctaLabelEs", "ctaLabelEn", "imageAltEs", "imageAltEn"]} submitLabel="Guardar y publicar" encType="multipart/form-data" onSuccess={onSuccess} prepareFormData={formData => { formData.set("galleryImages", JSON.stringify(gallery)); newFiles.forEach(file => formData.append("imageFiles", file)); return formData; }}>
    <input type="hidden" name="pageKey" value={pageKey}/>
    <AdminFormSection number="1" title="Encabezado" text="Contenido principal que se muestra al inicio de la página."><AdminFormGrid>
      <label><span>Etiqueta en español</span><input name="kickerEs" defaultValue={value.kickerEs}/></label><label><span>Etiqueta en inglés</span><input name="kickerEn" defaultValue={value.kickerEn}/></label>
      <label><span>Título en español</span><input name="titleEs" defaultValue={value.titleEs}/></label><label><span>Título en inglés</span><input name="titleEn" defaultValue={value.titleEn}/></label>
      <label><span>Descripción en español</span><textarea name="descriptionEs" defaultValue={value.descriptionEs} maxLength={2000}/></label><label><span>Descripción en inglés</span><textarea name="descriptionEn" defaultValue={value.descriptionEn} maxLength={2000}/></label>
    </AdminFormGrid></AdminFormSection>
    <AdminFormSection number="2" title="Bloque editorial" text="Texto que acompaña el contenido visual de la página."><AdminFormGrid>
      <label><span>Título secundario en español</span><input name="detailTitleEs" defaultValue={value.detailTitleEs}/></label><label><span>Título secundario en inglés</span><input name="detailTitleEn" defaultValue={value.detailTitleEn}/></label>
      <label><span>Primer párrafo en español</span><textarea name="detailBodyOneEs" defaultValue={value.detailBodyOneEs} maxLength={2000}/></label><label><span>Primer párrafo en inglés</span><textarea name="detailBodyOneEn" defaultValue={value.detailBodyOneEn} maxLength={2000}/></label>
      <label><span>Segundo párrafo en español</span><textarea name="detailBodyTwoEs" defaultValue={value.detailBodyTwoEs} maxLength={2000}/></label><label><span>Segundo párrafo en inglés</span><textarea name="detailBodyTwoEn" defaultValue={value.detailBodyTwoEn} maxLength={2000}/></label>
      <label><span>Botón en español</span><input name="ctaLabelEs" defaultValue={value.ctaLabelEs}/></label><label><span>Botón en inglés</span><input name="ctaLabelEn" defaultValue={value.ctaLabelEn}/></label>
    </AdminFormGrid></AdminFormSection>
    <AdminFormSection number="3" title="Imágenes" text="La primera es la principal. Bodas y Eventos muestran varias imágenes como carrusel.">
      <div style={{display:"grid",gap:12}}>{gallery.length===0&&<p>Sin imágenes propias: se usará la imagen actual o predeterminada.</p>}{gallery.map((image,index)=><div key={image.id} style={{display:"grid",gridTemplateColumns:"96px 1fr auto",gap:10,alignItems:"center",padding:8,border:"1px solid #e6e0d5",borderRadius:10}}><div style={{position:"relative",width:96,height:64,overflow:"hidden",borderRadius:7}}><Image src={image.url} alt="" fill sizes="96px" style={{objectFit:"cover"}} unoptimized/></div><span>{index===0?"Principal":"Imagen"} {index+1}</span><div style={{display:"flex",gap:4}}><button type="button" onClick={()=>moveImage(index,-1)} disabled={index===0}>↑</button><button type="button" onClick={()=>moveImage(index,1)} disabled={index===gallery.length-1}>↓</button><button type="button" onClick={()=>setGallery(current=>current.filter(item=>item.id!==image.id))}>Eliminar</button></div></div>)}{newFiles.map((file,index)=><div key={`${file.name}-${index}`} style={{display:"flex",justifyContent:"space-between",padding:8,border:"1px dashed #c9d1c5",borderRadius:10}}><span>Nueva imagen: {file.name}</span><button type="button" onClick={()=>setNewFiles(current=>current.filter((_,itemIndex)=>itemIndex!==index))}>Eliminar</button></div>)}</div>
      <Upload.Dragger className="product-image-dropzone" accept="image/jpeg,image/png,image/webp" multiple showUploadList={false} beforeUpload={beforeUpload}><PictureOutlined/><strong>Arrastra imágenes aquí</strong><span>o haz clic para seleccionar</span><button type="button"><UploadOutlined/> Seleccionar imágenes</button><small>JPG, PNG o WebP. Máximo 12 MB por imagen.</small></Upload.Dragger>
      <AdminFormGrid><label><span>Texto alternativo en español</span><input name="imageAltEs" defaultValue={value.imageAltEs}/></label><label><span>Texto alternativo en inglés</span><input name="imageAltEn" defaultValue={value.imageAltEn}/></label></AdminFormGrid>
    </AdminFormSection>
  </ValidatedAdminForm>;
}
