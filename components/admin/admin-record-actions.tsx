"use client";

import { AppstoreOutlined, DeleteOutlined, EditOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { App, Button, Modal, Space, Tooltip } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DraggableModal } from "./draggable-modal";

export function AdminRecordActions({assetsHref,editHref,deleteAction,id,deleteLabel="Eliminar",deleteValues}:{assetsHref?:string;editHref?:string;deleteAction?:(data:FormData)=>Promise<void>;id:string;deleteLabel?:string;deleteValues?:Record<string,string>}){
  const router=useRouter();const {message}=App.useApp();const[deleting,setDeleting]=useState(false);const[confirmOpen,setConfirmOpen]=useState(false);
  const remove=async()=>{if(!deleteAction)return;setDeleting(true);try{const data=new FormData();data.set("id",id);Object.entries(deleteValues??{}).forEach(([key,value])=>data.set(key,value));await deleteAction(data);setConfirmOpen(false);router.refresh();message.success("Registro actualizado correctamente.");}catch(error){message.error(error instanceof Error?error.message:"No se pudo completar la acción.");}finally{setDeleting(false);}};
  return <><Space size={4}>{editHref&&<Tooltip title="Editar"><Link href={editHref}><Button type="text" shape="circle" icon={<EditOutlined/>} aria-label="Editar"/></Link></Tooltip>}{assetsHref&&<Tooltip title="Variantes e imágenes"><Link href={assetsHref}><Button type="text" shape="circle" icon={<AppstoreOutlined/>} aria-label="Variantes e imágenes"/></Link></Tooltip>}{deleteAction&&<Tooltip title={deleteLabel}><Button danger type="text" shape="circle" loading={deleting} icon={<DeleteOutlined/>} aria-label={deleteLabel} onClick={() => setConfirmOpen(true)}/></Tooltip>}</Space><Modal className="admin-confirm-modal" open={confirmOpen} onCancel={() => !deleting&&setConfirmOpen(false)} onOk={remove} confirmLoading={deleting} title={<span className="admin-confirm-title"><ExclamationCircleFilled/> {deleteLabel} este registro</span>} okText={deleteLabel} cancelText="Cancelar" okButtonProps={{danger:true}} centered modalRender={modal => <DraggableModal>{modal}</DraggableModal>}><p>Esta acción no se puede deshacer.</p><p>¿Deseas continuar?</p></Modal></>;
}
