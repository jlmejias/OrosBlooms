"use client";

import { useState } from "react";
import { saveService } from "@/app/admin/actions";
import { AdminFormGrid, AdminFormSection } from "./admin-form-section";
import { ValidatedAdminForm } from "./validated-admin-form";

export type AdminService = {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  sortOrder: number;
  visible: boolean;
};

export type ServiceTranslation = {
  nameEn?: string;
  descriptionEn?: string;
};

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function ServiceForm({ editing, translation, suggestedSortOrder = 0, onSuccess }: {
  editing?: AdminService;
  translation?: ServiceTranslation;
  suggestedSortOrder?: number;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const slug = slugify(name);

  return <ValidatedAdminForm
    action={saveService}
    required={["nameEs", "slug", "type", "descriptionEs"]}
    submitLabel={editing ? "Guardar cambios" : "Crear servicio"}
    onSuccess={onSuccess}
  >
    <input type="hidden" name="id" value={editing?.id ?? ""}/>
    <AdminFormSection number="1" title="Información básica" text="Define cómo aparecerá el servicio y dónde se publicará.">
      <AdminFormGrid>
        <label><span>Nombre en español <em>*</em></span><input name="nameEs" value={name} onChange={event => setName(event.target.value)} placeholder="Ej. Decoración de bodas" required/></label>
        <label><span>Identificador URL <em>*</em></span><input name="slug" value={slug} placeholder="Se genera desde el nombre" readOnly/><small>Se genera automáticamente a partir del nombre.</small></label>
        <label><span>Tipo de servicio <em>*</em></span><input name="type" defaultValue={editing?.type ?? ""} placeholder="Ej. bodas" required/></label>
        <label><span>Nombre en inglés</span><input name="nameEn" defaultValue={translation?.nameEn ?? ""} placeholder="Ej. Wedding decoration"/></label>
      </AdminFormGrid>
    </AdminFormSection>
    <AdminFormSection number="2" title="Descripciones" text="Explica el servicio en español e inglés.">
      <AdminFormGrid>
        <label><span>Descripción en español <em>*</em></span><textarea name="descriptionEs" defaultValue={editing?.description ?? ""} placeholder="Describe el servicio" required maxLength={2000}/></label>
        <label><span>Descripción en inglés</span><textarea name="descriptionEn" defaultValue={translation?.descriptionEn ?? ""} placeholder="Describe the service" maxLength={2000}/></label>
      </AdminFormGrid>
    </AdminFormSection>
    <AdminFormSection number="3" title="Orden y visibilidad" text="Controla la posición y disponibilidad del servicio.">
      <AdminFormGrid>
        <label><span>Orden</span><input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? suggestedSortOrder} min={0} step={1}/><small>Los números menores aparecen primero.</small></label>
        <label className="admin-checkbox-field"><input name="visible" type="checkbox" defaultChecked={editing?.visible ?? true}/> <span>Visible en el sitio</span></label>
      </AdminFormGrid>
    </AdminFormSection>
  </ValidatedAdminForm>;
}
