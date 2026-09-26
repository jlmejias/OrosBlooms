"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DraggableModal } from "./draggable-modal";

export function AdminFormModal({ title, children }: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editing = title.startsWith("Editar");
  const creating = !editing && searchParams.get("new") === "1";
  const productModal = title.toLowerCase().includes("producto");
  const imageModal = title.toLowerCase().includes("imagen");
  const [createOpen, setCreateOpen] = useState(creating);
  const open = editing || creating || createOpen;
  const close = useCallback(() => { setCreateOpen(false); if (editing || creating) router.replace(pathname); }, [creating, editing, pathname, router]);
  useEffect(() => { if(creating)setCreateOpen(true); }, [creating]);
  useEffect(() => { if(!open)return; const saved=() => { close(); router.refresh(); }; document.addEventListener("form:success",saved); return () => document.removeEventListener("form:success",saved); }, [close, open, router]);
  return <div className="admin-modal-form-slot">
    {!editing && <Button className="admin-modal-trigger" type="primary" icon={<PlusOutlined/>} onClick={() => setCreateOpen(true)}>{title}</Button>}
    <Modal className={`admin-standard-modal ${productModal?"admin-product-modal":imageModal?"admin-product-image-modal":""}`} title={<div className="admin-modal-title"><strong>{title}</strong><span>{productModal?"Completa la información para agregar un nuevo producto a tu catálogo.":imageModal?"Agrega una imagen a la galería del producto.":"Completa la información y guarda los cambios."}</span></div>} open={open} onCancel={close} footer={null} destroyOnHidden width={productModal?960:imageModal?600:720} centered modalRender={modal => <DraggableModal>{modal}</DraggableModal>}>{open&&<div>{children}</div>}</Modal>
  </div>;
}
