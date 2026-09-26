"use client";

import Image from "next/image";
import { AppstoreOutlined, EditOutlined, PictureOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminRecordActions } from "./admin-record-actions";
import { AdminFormModal } from "./admin-form-modal";
import { ValidatedAdminForm } from "./validated-admin-form";
import { ProductImageForm } from "./product-image-form";
import { DraggableModal } from "./draggable-modal";
import { AdminFormGrid, AdminFormSection } from "./admin-form-section";
import { deleteProductImage, deleteProductVariant, saveProductVariant } from "@/app/admin/actions";

type Variant = { id: string; name: string; price: number; available: boolean; sortOrder: number };
type ProductImage = { id: string; url: string; alt: string | null; primary: boolean; sortOrder: number };

function VariantFields({ variant }: { variant?: Variant }) {
  return <AdminFormSection number="1" title="Información de la variante" text="Define el nombre, precio, orden y disponibilidad."><AdminFormGrid><label><span>Nombre <em>*</em></span><input name="name" defaultValue={variant?.name} placeholder="Ej. Grande" required/></label><label><span>Precio <em>*</em></span><input name="price" type="number" defaultValue={variant?.price} placeholder="0" min="0" required/></label><label><span>Orden</span><input name="sortOrder" type="number" defaultValue={variant?.sortOrder} placeholder="0" min="0"/></label><label className="admin-checkbox-field"><input name="available" type="checkbox" defaultChecked={variant?.available??true}/> <span>Disponible</span></label></AdminFormGrid></AdminFormSection>;
}

export function ProductAssetsEditor({ productId, variants, images }: { productId: string; variants: Variant[]; images: ProductImage[] }) {
  const router = useRouter();
  const [editingVariant, setEditingVariant] = useState<Variant>();
  return <div className="product-assets-editor">
    <section className="product-assets-section">
      <header className="product-assets-header"><div className="product-assets-heading"><span><AppstoreOutlined/></span><div><h2>Variantes</h2><p>Gestiona presentaciones y precios del producto.</p></div></div><AdminFormModal title="Nueva variante"><ValidatedAdminForm action={saveProductVariant} required={["productId", "name", "price"]} submitLabel="Agregar variante" className="admin-form"><input type="hidden" name="productId" value={productId}/><VariantFields/></ValidatedAdminForm></AdminFormModal></header>
      <table className="admin-table product-variants-table"><thead><tr><th>Nombre</th><th>Precio</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{variants.map(item => <tr key={item.id}><td><span className="product-variant-name"><AppstoreOutlined/>{item.name}</span></td><td>₡{item.price.toLocaleString("es-CR")}</td><td><span className={item.available ? "product-asset-status" : "product-asset-status is-hidden"}>{item.available ? "Disponible" : "Oculta"}</span></td><td><span className="product-variant-actions"><Button type="text" shape="circle" icon={<EditOutlined/>} aria-label="Editar variante" onClick={() => setEditingVariant(item)}/><AdminRecordActions id={item.id} deleteAction={deleteProductVariant}/></span></td></tr>)}</tbody></table>
    </section>
    <section className="product-assets-section">
      <header className="product-assets-header"><div className="product-assets-heading"><span><PictureOutlined/></span><div><h2>Imágenes</h2><p>Administra la galería y la imagen principal del producto.</p></div></div><AdminFormModal title="Nueva imagen"><ProductImageForm productId={productId}/></AdminFormModal></header>
      <div className="product-images-grid">{images.map(item => <article key={item.id}><div className="product-image-card"><Image src={item.url} alt={item.alt ?? ""} fill unoptimized/>{item.primary && <span className="product-primary-badge">Principal</span>}</div><div className="product-image-card-footer"><div><strong>{item.alt || "Imagen del producto"}</strong><small>Orden {item.sortOrder}</small></div><AdminRecordActions id={item.id} deleteAction={deleteProductImage}/></div></article>)}</div>
    </section>
    <Modal className="admin-standard-modal" title={<div className="admin-modal-title"><strong>Editar variante</strong><span>Actualiza la información y guarda los cambios.</span></div>} open={Boolean(editingVariant)} onCancel={() => setEditingVariant(undefined)} footer={null} destroyOnHidden width={720} centered modalRender={modal => <DraggableModal>{modal}</DraggableModal>}>{editingVariant&&<ValidatedAdminForm action={saveProductVariant} required={["id", "productId", "name", "price"]} submitLabel="Guardar cambios" className="admin-form" onSuccess={() => { setEditingVariant(undefined); router.refresh(); }}><input type="hidden" name="id" value={editingVariant.id}/><input type="hidden" name="productId" value={productId}/><VariantFields variant={editingVariant}/></ValidatedAdminForm>}</Modal>
  </div>;
}
