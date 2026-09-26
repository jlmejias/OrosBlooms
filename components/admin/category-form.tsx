"use client";

import { useState } from "react";
import { saveCategory } from "@/app/admin/actions";
import { AdminFormSection } from "./admin-form-section";
import { ValidatedAdminForm } from "./validated-admin-form";

type Category = { id?: string; name?: string; slug?: string; description?: string | null; sortOrder?: number; visible?: boolean };

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function CategoryForm({ editing, suggestedSortOrder = 0, onSuccess }: { editing?: Category; suggestedSortOrder?: number; onSuccess?: () => void }) {
  const [name, setName] = useState(editing?.name ?? "");
  const slug = slugify(name);
  return <ValidatedAdminForm action={saveCategory} required={["name", "slug", "sortOrder"]} submitLabel={editing ? "Guardar cambios" : "Crear categoría"} onSuccess={onSuccess}>
    <input type="hidden" name="id" value={editing?.id ?? ""}/>
    <AdminFormSection number="1" title="Información básica" text="Define cómo aparecerá la categoría en el catálogo.">
      <label><span>Nombre <em>*</em></span><input name="name" value={name} onChange={event => setName(event.target.value)} placeholder="Ej. Ramos de temporada" required/></label>
      <label><span>Identificador URL <em>*</em></span><input name="slug" value={slug} placeholder="Se genera desde el nombre" readOnly aria-describedby="category-slug-help"/><small id="category-slug-help">Se genera automáticamente a partir del nombre.</small></label>
      <label><span>Descripción</span><textarea name="description" defaultValue={editing?.description ?? ""} placeholder="Escribe una descripción breve" maxLength={500}/></label>
    </AdminFormSection>
    <AdminFormSection number="2" title="Orden y visibilidad" text="Controla la posición y disponibilidad de la categoría.">
      <label><span>Orden <em>*</em></span><input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? suggestedSortOrder} min={0} step={1} required/><small>Los números menores aparecen primero y no se pueden repetir.</small></label>
      <label className="admin-checkbox-field"><input name="visible" type="checkbox" defaultChecked={editing?.visible ?? true}/> <span>Visible en el catálogo</span></label>
    </AdminFormSection>
  </ValidatedAdminForm>;
}
