"use client";

import { Image, Upload } from "antd";
import type { UploadProps } from "antd";
import { DeleteOutlined, PictureOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { saveCombo } from "@/app/admin/actions";
import { AdminFormGrid, AdminFormSection } from "./admin-form-section";
import { ValidatedAdminForm } from "./validated-admin-form";

type Combo = { id: string; name: string; description: string | null; imageUrl: string | null; price: number; promotionalPrice: number | null; startsAt: Date | null; endsAt: Date | null; featured: boolean; active: boolean };
type Product = { id: string; name: string };

function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

async function compressImage(file: File) {
  if (!file.type.startsWith("image/") || file.size < 300_000) return file;
  try { const image = await createImageBitmap(file); const scale = Math.min(1, 1600 / Math.max(image.width, image.height)); const canvas = document.createElement("canvas"); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale); canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height); image.close(); const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", .82)); return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" }) : file; } catch { return file; }
}

export function ComboForm({ editing, products, selectedProducts }: { editing?: Combo; products: Product[]; selectedProducts: Set<string> }) {
  const [name, setName] = useState(editing?.name ?? ""); const [preview, setPreview] = useState(editing?.imageUrl ?? ""); const [imageFile, setImageFile] = useState<File>(); const [removeImage, setRemoveImage] = useState(false); const previewUrl = useRef(""); const slug = slugify(name);
  useEffect(() => () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, []);
  const beforeUpload: UploadProps["beforeUpload"] = async file => { const compressed = await compressImage(file as File); if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); const url = URL.createObjectURL(compressed); previewUrl.current = url; setImageFile(compressed); setPreview(url); setRemoveImage(false); return Upload.LIST_IGNORE; };
  const clearImage = (event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); event.stopPropagation(); if (previewUrl.current) { URL.revokeObjectURL(previewUrl.current); previewUrl.current = ""; } setImageFile(undefined); setPreview(""); setRemoveImage(Boolean(editing?.imageUrl)); };
  return <ValidatedAdminForm action={saveCombo} required={["name", "slug", "price"]} submitLabel={editing ? "Guardar cambios" : "Crear combo"} className="admin-form product-form" encType="multipart/form-data" prepareFormData={formData => { if (imageFile) formData.set("imageFile", imageFile); if (removeImage) formData.set("removeImage", "on"); return formData; }}>
    {editing && <input type="hidden" name="id" value={editing.id}/>} 
    <div className="product-form-layout combo-form-layout"><div className="product-form-main">
      <AdminFormSection number="1" title="Información del combo" text="Nombre, descripción, precio y vigencia."><AdminFormGrid><label><span>Nombre <em>*</em></span><input name="name" value={name} onChange={event => setName(event.target.value)} placeholder="Ej. Regalo especial" required/></label><label><span>Identificador URL <em>*</em></span><input name="slug" value={slug} readOnly placeholder="Se genera desde el nombre"/><small>Se genera automáticamente a partir del nombre.</small></label></AdminFormGrid><label><span>Descripción</span><textarea className="combo-form-description" name="description" defaultValue={editing?.description ?? ""} placeholder="Describe el contenido del combo..." maxLength={2000}/></label><AdminFormGrid><label><span>Precio <em>*</em></span><input name="price" type="number" defaultValue={editing?.price} placeholder="0" min="0" required/></label><label><span>Precio promocional</span><input name="promotionalPrice" type="number" defaultValue={editing?.promotionalPrice ?? ""} placeholder="0" min="0"/></label><label><span>Inicio</span><input name="startsAt" type="datetime-local" defaultValue={editing?.startsAt?.toISOString().slice(0, 16)} /></label><label><span>Fin</span><input name="endsAt" type="datetime-local" defaultValue={editing?.endsAt?.toISOString().slice(0, 16)} /></label></AdminFormGrid></AdminFormSection>
      <AdminFormSection number="2" title="Productos y estado" text="Selecciona los productos y controla la visibilidad."><div className="combo-form-products">{products.map(item => <label key={item.id}><input type="checkbox" name="productIds" value={item.id} defaultChecked={selectedProducts.has(item.id)}/> <span>{item.name}</span></label>)}</div><AdminFormGrid><label className="admin-checkbox-field"><input name="featured" type="checkbox" defaultChecked={editing?.featured}/> <span>Destacado</span></label><label className="admin-checkbox-field"><input name="active" type="checkbox" defaultChecked={editing?.active ?? true}/> <span>Activo</span></label></AdminFormGrid></AdminFormSection>
    </div><aside className="product-form-media"><AdminFormSection number="3" title="Imagen del combo" text="Agrega una imagen atractiva que represente el combo."><Upload.Dragger className={`product-image-dropzone${preview ? " has-preview" : ""}`} accept="image/jpeg,image/png,image/webp" maxCount={1} showUploadList={false} beforeUpload={beforeUpload}>{preview ? <div className="product-image-selected"><Image src={preview} alt="Vista previa del combo" preview={false}/><div className="product-image-selected-overlay"><PictureOutlined/><strong>{imageFile ? "Imagen seleccionada" : "Imagen actual"}</strong><span>Haz clic para cambiarla</span><button type="button" className="product-image-remove" onClick={clearImage}><DeleteOutlined/> Eliminar imagen</button></div></div> : <><PictureOutlined/><strong>Arrastra una imagen aquí</strong><span>o haz clic para seleccionar</span><button type="button"><UploadOutlined/> Seleccionar imagen</button></>}<small>JPG, PNG o WebP. Se comprime automáticamente.</small></Upload.Dragger></AdminFormSection></aside></div>
  </ValidatedAdminForm>;
}
