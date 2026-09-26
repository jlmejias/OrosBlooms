"use client";

import { Image, Upload } from "antd";
import type { UploadProps } from "antd";
import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { saveProductImage } from "@/app/admin/actions";
import { AdminFormGrid, AdminFormSection } from "./admin-form-section";
import { ValidatedAdminForm } from "./validated-admin-form";

async function compressImage(file: File) {
  if (!file.type.startsWith("image/") || file.size < 300_000) return file;
  try {
    const image = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height); image.close();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", .82));
    return blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" }) : file;
  } catch { return file; }
}

export function ProductImageForm({ productId }: { productId: string }) {
  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState<File>();
  const previewUrl = useRef("");
  useEffect(() => () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, []);
  const beforeUpload: UploadProps["beforeUpload"] = async file => { const compressed = await compressImage(file as File); if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); const url = URL.createObjectURL(compressed); previewUrl.current = url; setImageFile(compressed); setPreview(url); return Upload.LIST_IGNORE; };
  const clearImage = (event:React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); event.stopPropagation(); if (previewUrl.current) { URL.revokeObjectURL(previewUrl.current); previewUrl.current = ""; } setImageFile(undefined); setPreview(""); };
  return <ValidatedAdminForm action={saveProductImage} className="admin-form product-image-form" required={["productId", "imageSelected"]} submitLabel="Guardar imagen" encType="multipart/form-data" prepareFormData={formData => { if (imageFile) formData.set("imageFile", imageFile); return formData; }}>
    <input type="hidden" name="productId" value={productId}/>
    <input type="hidden" name="imageSelected" value={imageFile ? "yes" : ""}/>
    <AdminFormSection number="1" title="Archivo de imagen" text="Selecciona la fotografía que quieres agregar a la galería."><Upload.Dragger className={`product-image-upload-dropzone${preview ? " has-preview" : ""}`} accept="image/jpeg,image/png,image/webp" maxCount={1} showUploadList={false} beforeUpload={beforeUpload}>{preview?<div className="product-image-selected"><Image src={preview} alt="Vista previa" preview={false}/><div className="product-image-selected-overlay"><CloudUploadOutlined/><strong>Imagen seleccionada</strong><span>Haz clic para cambiarla</span><button type="button" className="product-image-remove" onClick={clearImage}><DeleteOutlined/> Eliminar imagen</button></div></div>:<><CloudUploadOutlined/><strong>Arrastra una imagen aquí</strong><span>o haz clic para seleccionar</span></>}<small>JPG, PNG o WebP · Máx. 8 MB</small></Upload.Dragger></AdminFormSection>
    <AdminFormSection number="2" title="Detalles de la imagen" text="Añade una descripción, el orden y define si será la imagen principal."><label className="product-image-form-control">Descripción<input name="alt" placeholder="Describe la imagen (opcional)"/></label><AdminFormGrid><label className="product-image-form-control">Orden<input name="sortOrder" type="number" defaultValue="0" min="0" placeholder="0"/></label><label className="product-image-primary"><input name="primary" type="checkbox"/> <span>Usar como imagen principal</span><small>Se mostrará primero en la galería.</small></label></AdminFormGrid></AdminFormSection>
  </ValidatedAdminForm>;
}
