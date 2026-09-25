"use client";

import { Button, Input, InputNumber, Modal, Switch } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { createCategoryQuick } from "@/app/admin/actions";

type CategoryOption = { id: string; name: string };

function categorySlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function CategoryQuickSelect({ categories, initialCategoryId = "" }: { categories: CategoryOption[]; initialCategoryId?: string }) {
  const [options, setOptions] = useState(categories);
  const [selectedId, setSelectedId] = useState(initialCategoryId);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [visible, setVisible] = useState(true);

  const close = () => { if (!saving) { setOpen(false); setError(""); } };
  const reset = () => { setName(""); setSlug(""); setSlugEdited(false); setDescription(""); setSortOrder(0); setVisible(true); setError(""); };
  const create = async () => {
    const normalizedName = name.trim();
    if (normalizedName.length < 2 || !/^[a-z0-9-]+$/.test(slug)) { setError("Completa el nombre y usa un identificador válido."); return; }
    setSaving(true); setError("");
    try {
      const data = new FormData();
      data.set("name", normalizedName); data.set("slug", slug); data.set("description", description.trim()); data.set("sortOrder", String(sortOrder)); data.set("visible", String(visible));
      const created = await createCategoryQuick(data);
      setOptions(current => [...current, created].sort((a, b) => a.name.localeCompare(b.name, "es")));
      setSelectedId(created.id); setOpen(false); reset();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo crear la categoría."); }
    finally { setSaving(false); }
  };

  return <>
    <div className="admin-category-picker">
      <label>Categoría<select name="categoryId" value={selectedId} onChange={event => setSelectedId(event.target.value)}><option value="">Sin categoría</option>{options.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <Button htmlType="button" icon={<PlusOutlined/>} onClick={() => setOpen(true)}>Nueva categoría</Button>
    </div>
    <Modal title="Nueva categoría" open={open} onCancel={close} destroyOnHidden footer={<><Button htmlType="button" onClick={close} disabled={saving}>Cancelar</Button><Button htmlType="button" type="primary" loading={saving} onClick={create}>Crear y seleccionar</Button></>}>
      <div className="admin-quick-category-form">
        {error && <p role="alert" className="admin-quick-category-error">{error}</p>}
        <label htmlFor="quick-category-name">Nombre de categoría</label><Input id="quick-category-name" value={name} autoFocus maxLength={100} onChange={event => { const next=event.target.value;setName(next);if(!slugEdited)setSlug(categorySlug(next)); }}/>
        <label htmlFor="quick-category-slug">Identificador URL</label><Input id="quick-category-slug" value={slug} maxLength={100} onChange={event => { setSlugEdited(true);setSlug(categorySlug(event.target.value)); }}/>
        <label htmlFor="quick-category-description">Descripción</label><Input.TextArea id="quick-category-description" value={description} maxLength={500} rows={3} onChange={event => setDescription(event.target.value)}/>
        <label htmlFor="quick-category-order">Orden</label><InputNumber id="quick-category-order" value={sortOrder} min={0} precision={0} onChange={value => setSortOrder(value ?? 0)} />
        <label className="admin-quick-category-switch"><Switch checked={visible} onChange={setVisible}/> Visible en el catálogo</label>
      </div>
    </Modal>
  </>;
}
