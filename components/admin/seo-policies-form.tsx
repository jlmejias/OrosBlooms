"use client";

import { App, Button, Input, Tabs } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveSeoPolicies } from "@/app/admin/actions";
import type { LegalPolicy, LegalPolicyKey, SeoPolicies } from "@/lib/seo-policies";
import { AdminFormGrid, AdminFormSection } from "./admin-form-section";

const labels: Record<LegalPolicyKey, string> = {
  privacy: "Privacidad",
  terms: "Términos",
  delivery: "Entregas y retiro",
  cancellations: "Cancelaciones y reembolsos",
  floralSubstitution: "Sustitución floral",
  weddingsEvents: "Bodas y eventos",
  accessibility: "Accesibilidad",
};
const legalPolicyKeys: LegalPolicyKey[] = ["privacy", "terms", "delivery", "cancellations", "floralSubstitution", "weddingsEvents", "accessibility"];

function PolicyForm({ policyKey, policy }: { policyKey: LegalPolicyKey; policy: LegalPolicy }) {
  const { message } = App.useApp();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  return <form className="admin-form admin-pattern-form seo-policies-form" action={async form => {
    setSaving(true);
    try {
      await saveSeoPolicies(form);
      message.success("Política guardada.");
      router.refresh();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }}>
    <input type="hidden" name="section" value={policyKey}/>
    <AdminFormSection number="1" title={labels[policyKey]} text="Edita el documento en ambos idiomas y controla su publicación.">
      <AdminFormGrid>
        <label><span>Título en español</span><Input name="titleEs" defaultValue={policy.titleEs} required/></label>
        <label><span>Título en inglés</span><Input name="titleEn" defaultValue={policy.titleEn} required/></label>
        <label><span>Contenido en español</span><Input.TextArea name="contentEs" defaultValue={policy.contentEs} rows={13} required/></label>
        <label><span>Contenido en inglés</span><Input.TextArea name="contentEn" defaultValue={policy.contentEn} rows={13} required/></label>
      </AdminFormGrid>
    </AdminFormSection>
    <AdminFormSection number="2" title="Fecha y publicación" text="Un borrador no se muestra como política pública.">
      <AdminFormGrid>
        <label><span>Última actualización</span><Input name="updatedAt" type="date" defaultValue={policy.updatedAt}/></label>
        <label><span>Estado</span><span><input name="published" type="checkbox" defaultChecked={policy.published}/> Publicada</span></label>
      </AdminFormGrid>
    </AdminFormSection>
    <Button type="primary" htmlType="submit" loading={saving}>Guardar política</Button>
  </form>;
}

function SeoForm({ value }: { value: SeoPolicies }) {
  const { message } = App.useApp();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  return <form className="admin-form admin-pattern-form seo-policies-form" action={async form => {
    setSaving(true);
    try {
      await saveSeoPolicies(form);
      message.success("SEO guardado.");
      router.refresh();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }}>
    <input type="hidden" name="section" value="seo"/>
    <AdminFormSection number="1" title="Metadatos del sitio" text="Define los títulos y descripciones que aparecen en buscadores.">
      <AdminFormGrid>
        <label><span>Título del sitio en español</span><Input name="siteTitleEs" defaultValue={value.siteTitleEs}/></label>
        <label><span>Título del sitio en inglés</span><Input name="siteTitleEn" defaultValue={value.siteTitleEn}/></label>
        <label><span>Descripción SEO en español</span><Input.TextArea name="descriptionEs" defaultValue={value.descriptionEs} rows={7}/></label>
        <label><span>Descripción SEO en inglés</span><Input.TextArea name="descriptionEn" defaultValue={value.descriptionEn} rows={7}/></label>
      </AdminFormGrid>
    </AdminFormSection>
    <Button type="primary" htmlType="submit" loading={saving}>Guardar SEO</Button>
  </form>;
}

export function SeoPoliciesForm({ value, policies }: { value: SeoPolicies; policies: Record<LegalPolicyKey, LegalPolicy> }) {
  return <Tabs items={[
    { key: "seo", label: "SEO", children: <SeoForm value={value}/> },
    ...legalPolicyKeys.map(key => {
      const policy = policies[key];
      return { key, label: `${labels[key]} · ${policy.published ? "Publicada" : "Borrador"}`, children: <PolicyForm key={key} policyKey={key} policy={policy}/> };
    }),
  ]}/>;
}
