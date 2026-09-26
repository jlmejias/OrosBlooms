"use client";

import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Pagination, Select } from "antd";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { deleteService } from "@/app/admin/actions";
import { AdminRecordActions } from "./admin-record-actions";
import { DraggableModal } from "./draggable-modal";
import { ServiceForm, type AdminService, type ServiceTranslation } from "./service-form";

const perPage = 5;

export function ServiceManager({ items, translations }: {
  items: AdminService[];
  translations: Record<string, ServiceTranslation>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminService | undefined>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const usedOrders = new Set(items.map(item => item.sortOrder));
  const suggestedSortOrder = items.reduce(next => { while (usedOrders.has(next)) next += 1; return next; }, 0);
  const types = useMemo(() => [...new Set(items.map(item => item.type))].sort((a, b) => a.localeCompare(b)), [items]);
  const filtered = useMemo(() => items.filter(item => {
    const matchesSearch = !search || `${item.name} ${item.slug} ${translations[item.id]?.nameEn ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesType = !type || item.type === type;
    const matchesStatus = !status || (status === "visible" ? item.visible : !item.visible);
    return matchesSearch && matchesType && matchesStatus;
  }), [items, search, status, translations, type]);
  const visible = filtered.slice((page - 1) * perPage, page * perPage);
  const changeFilter = (update: () => void) => { update(); setPage(1); };
  const startCreate = () => { setEditing(undefined); setOpen(true); };
  const startEdit = (item: AdminService) => { setEditing(item); setOpen(true); };
  const close = () => setOpen(false);

  return <>
    <div className="admin-grid">
      <div className="admin-modal-form-slot"><Button className="admin-modal-trigger" type="primary" icon={<PlusOutlined/>} onClick={startCreate}>Nuevo servicio</Button></div>
      <div className="product-table-workspace service-table-workspace">
        <div className="product-table-filters">
          <Input prefix={<SearchOutlined/>} placeholder="Buscar servicios..." value={search} onChange={event => changeFilter(() => setSearch(event.target.value))}/>
          <Select value={type || undefined} placeholder="Todos los tipos" allowClear options={types.map(value => ({ value, label: value }))} onChange={value => changeFilter(() => setType(value ?? ""))}/>
          <Select value={status || undefined} placeholder="Todos los estados" allowClear options={[{ value: "visible", label: "Visible" }, { value: "hidden", label: "Oculto" }]} onChange={value => changeFilter(() => setStatus(value ?? ""))}/>
        </div>
        <section className="product-table-card"><table className="admin-table product-table service-table"><thead><tr><th>Servicio</th><th>Tipo</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{visible.map(item => <tr key={item.id}><td><div className="service-table-name"><strong>{item.name}</strong><small>{translations[item.id]?.nameEn || item.slug}</small></div></td><td>{item.type}</td><td>{item.sortOrder}</td><td><span className={`product-table-status ${item.visible ? "is-active" : "is-archived"}`}>{item.visible ? "Visible" : "Oculto"}</span></td><td><div className="service-table-actions"><Button type="text" shape="circle" icon={<EditOutlined/>} aria-label="Editar" onClick={() => startEdit(item)}/><AdminRecordActions id={item.id} deleteAction={deleteService}/></div></td></tr>)}</tbody></table><footer><span>Mostrando {filtered.length ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, filtered.length)} de {filtered.length} servicios</span><Pagination current={page} pageSize={perPage} total={filtered.length} showSizeChanger={false} onChange={setPage}/></footer></section>
      </div>
    </div>
    <Modal
      className="admin-standard-modal"
      title={<div className="admin-modal-title"><strong>{editing ? "Editar servicio" : "Nuevo servicio"}</strong><span>Define la información, traducciones, orden y visibilidad del servicio.</span></div>}
      open={open}
      onCancel={close}
      footer={null}
      destroyOnHidden
      width={720}
      centered
      modalRender={modal => <DraggableModal>{modal}</DraggableModal>}
    >
      <ServiceForm
        key={editing?.id ?? "new"}
        editing={editing}
        translation={editing ? translations[editing.id] : undefined}
        suggestedSortOrder={suggestedSortOrder}
        onSuccess={() => { close(); router.refresh(); }}
      />
    </Modal>
  </>;
}
