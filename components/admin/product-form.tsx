"use client";

import { Image, Upload } from "antd";
import type { UploadProps } from "antd";
import { DeleteOutlined, PictureOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { saveProduct } from "@/app/admin/actions";
import { AdminFormGrid, AdminFormSection } from "./admin-form-section";
import { CategoryQuickSelect } from "./category-quick-select";
import { ValidatedAdminForm } from "./validated-admin-form";

type Category = { id: string; name: string };
type Product = { id: string; name: string; type: "floral" | "complement" | "personalized"; categoryId: string | null; basePrice: number; status: "draft" | "active" | "archived"; featured: boolean; shortDescription: string | null };

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function compressImage(file: File) {
  if (!file.type.startsWith("image/") || file.size < 300_000) return file;
  try {
    const image = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.close();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", .82));
    return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" }) : file;
  } catch { return file; }
}

export function ProductForm({ editing, categories, initialImageUrl = "" }: { editing?: Product; categories: Category[]; initialImageUrl?: string }) {
  const [name, setName] = useState(editing?.name ?? "");
  const [preview, setPreview] = useState(initialImageUrl);
  const [imageFile, setImageFile] = useState<File>();
  const [removeImage, setRemoveImage] = useState(false);
  const previewUrl = useRef("");
  const slug = slugify(name);
  useEffect(() => () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, []);
  const beforeUpload: UploadProps["beforeUpload"] = async file => { const compressed = await compressImage(file as File); if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); const url = URL.createObjectURL(compressed); previewUrl.current = url; setImageFile(compressed); setPreview(url); setRemoveImage(false); return Upload.LIST_IGNORE; };
  const clearImage = (event:React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); event.stopPropagation(); if (previewUrl.current) { URL.revokeObjectURL(previewUrl.current); previewUrl.current = ""; } setImageFile(undefined); setPreview(""); setRemoveImage(Boolean(initialImageUrl)); };
  return <ValidatedAdminForm action={saveProduct} className="admin-form product-form" required={["name", "slug", "basePrice"]} submitLabel={editing ? "Guardar cambios" : "Crear producto"} encType="multipart/form-data" prepareFormData={formData => { if (imageFile) formData.set("imageFile", imageFile); if (removeImage) formData.set("removeImage", "on"); return formData; }}>
    {editing && <input type="hidden" name="id" value={editing.id}/>} 
    <div className="product-form-layout">
      <div className="product-form-main">
        <AdminFormSection number="1" title="Información básica" text="Datos principales del producto.">
          <AdminFormGrid>
            <label><span>Nombre del producto <em>*</em></span><input name="name" value={name} onChange={event => setName(event.target.value)} placeholder="Ej. Ramo de rosas rojas" required/></label>
            <label><span>Identificador URL <em>*</em></span><input name="slug" value={slug} readOnly placeholder="Se genera desde el nombre"/><small>Se genera automáticamente a partir del nombre.</small></label>
          </AdminFormGrid>
          <label><span>Tipo <em>*</em></span><select name="type" defaultValue={editing?.type ?? "floral"}><option value="floral">💐 Floral</option><option value="complement">🎁 Complemento</option><option value="personalized">✨ Personalizado</option></select></label>
          <CategoryQuickSelect categories={categories} initialCategoryId={editing?.categoryId ?? ""}/>
        </AdminFormSection>
        <AdminFormSection number="2" title="Precio y estado" text="Define el precio y disponibilidad del producto.">
          <AdminFormGrid>
            <label><span>Precio <em>*</em></span><input name="basePrice" type="number" defaultValue={editing?.basePrice} placeholder="0" min={0} step={1} required/></label>
            <label>Estado<select name="status" defaultValue={editing?.status ?? "draft"}><option value="draft">● Borrador</option><option value="active">● Activo</option><option value="archived">● Archivado</option></select></label>
            <label className="admin-checkbox-field"><input name="featured" type="checkbox" defaultChecked={editing?.featured}/><span>Destacar en la portada</span></label>
          </AdminFormGrid>
        </AdminFormSection>
        <AdminFormSection number="3" title="Descripción" text="Describe el producto, materiales, medidas o detalles.">
          <label>Descripción<textarea name="description" defaultValue={editing?.shortDescription ?? ""} placeholder="Escribe una descripción detallada del producto..." maxLength={2000}/></label>
        </AdminFormSection>
      </div>
      <aside className="product-form-media">
        <AdminFormSection number="4" title="Imagen del producto" text="Agrega una imagen atractiva de tu producto.">
          <Upload.Dragger className={`product-image-dropzone${preview ? " has-preview" : ""}`} accept="image/jpeg,image/png,image/webp" maxCount={1} showUploadList={false} beforeUpload={beforeUpload}>
            {preview ? <div className="product-image-selected"><Image src={preview} alt="Vista previa del producto" preview={false}/><div className="product-image-selected-overlay"><PictureOutlined/><strong>{imageFile ? "Imagen seleccionada" : "Imagen actual"}</strong><span>Haz clic para cambiarla</span><button type="button" className="product-image-remove" onClick={clearImage}><DeleteOutlined/> Eliminar imagen</button></div></div> : <><PictureOutlined/><strong>Arrastra una imagen aquí</strong><span>o haz clic para seleccionar</span><button type="button"><UploadOutlined/> Seleccionar imagen</button></>}
            <small>JPG, PNG o WebP. Se comprime automáticamente.</small>
          </Upload.Dragger>
        </AdminFormSection>
      </aside>
    </div>
  </ValidatedAdminForm>;
}
