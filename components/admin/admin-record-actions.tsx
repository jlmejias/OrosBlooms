"use client";

import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { App, Button, Popconfirm, Space, Tooltip } from "antd";
import Link from "next/link";
import { useState } from "react";

export function AdminRecordActions({editHref,deleteAction,id,deleteLabel="Eliminar",deleteValues}:{editHref?:string;deleteAction?:(data:FormData)=>Promise<void>;id:string;deleteLabel?:string;deleteValues?:Record<string,string>}){
  const {message}=App.useApp();const[deleting,setDeleting]=useState(false);
  const remove=async()=>{if(!deleteAction)return;setDeleting(true);try{const data=new FormData();data.set("id",id);Object.entries(deleteValues??{}).forEach(([key,value])=>data.set(key,value));await deleteAction(data);message.success("Registro actualizado correctamente.");}catch(error){message.error(error instanceof Error?error.message:"No se pudo completar la acción.");}finally{setDeleting(false);}};
  return <Space size={4}>{editHref&&<Tooltip title="Editar"><Link href={editHref}><Button type="text" shape="circle" icon={<EditOutlined/>} aria-label="Editar"/></Link></Tooltip>}{deleteAction&&<Popconfirm title={`${deleteLabel} este registro`} description="Esta acción no se puede deshacer." okText={deleteLabel} cancelText="Cancelar" okButtonProps={{danger:true}} onConfirm={remove}><Tooltip title={deleteLabel}><Button danger type="text" shape="circle" loading={deleting} icon={<DeleteOutlined/>} aria-label={deleteLabel}/></Tooltip></Popconfirm>}</Space>;
}
