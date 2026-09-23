"use client";

import { App, Button, Checkbox, Form, Input } from "antd";
import { useFormik } from "formik";
import * as yup from "yup";
import { saveHomepageSection } from "@/app/admin/actions";
import { homepageSectionDefaults, type HomepageSectionKey } from "@/lib/homepage";

type Content = { titleEs?: string; titleEn?: string; subtitleEs?: string; subtitleEn?: string };
type Section = { id?: string; key: HomepageSectionKey; visible?: boolean; content?: Record<string, unknown> };

const schema = yup.object({
  titleEs: yup.string().trim().required("Escribe el título en español"),
  titleEn: yup.string().trim().required("Escribe el título en inglés"),
  subtitleEs: yup.string().trim().required("Escribe el texto de apoyo en español"),
  subtitleEn: yup.string().trim().required("Escribe el texto de apoyo en inglés"),
});

export function HomepageSectionForm({ section }: { section: Section }) {
  const { message } = App.useApp();
  const fallback = homepageSectionDefaults[section.key];
  const content = section.content as Content | undefined;
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      titleEs: content?.titleEs ?? fallback.titleEs,
      titleEn: content?.titleEn ?? fallback.titleEn,
      subtitleEs: content?.subtitleEs ?? fallback.subtitleEs,
      subtitleEn: content?.subtitleEn ?? fallback.subtitleEn,
      visible: section.visible ?? true,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const data = new FormData();
        if (section.id) data.set("id", section.id);
        data.set("key", section.key);
        data.set("sortOrder", String(fallback.sortOrder));
        data.set("titleEs", values.titleEs);
        data.set("titleEn", values.titleEn);
        data.set("subtitleEs", values.subtitleEs);
        data.set("subtitleEn", values.subtitleEn);
        if (values.visible) data.set("visible", "on");
        await saveHomepageSection(data);
        message.success("Sección guardada. La portada ya está actualizada.");
      } catch (error) {
        message.error(error instanceof Error ? error.message : "No se pudo guardar la sección.");
      }
    },
  });
  const error = (name: keyof typeof formik.values) => formik.touched[name] && formik.errors[name] ? String(formik.errors[name]) : undefined;

  return <form className="admin-form home-editor-form" onSubmit={formik.handleSubmit}>
    <p className="admin-form-hint">Editando: <strong>{fallback.label}</strong></p>
    <div className="home-editor-languages">
      <section className="admin-form-section"><header><h3>Español</h3><p>Contenido que verá el sitio en español.</p></header>
        <Form.Item label="Título" help={error("titleEs")} validateStatus={error("titleEs") ? "error" : ""}><Input value={formik.values.titleEs} onChange={(event) => formik.setFieldValue("titleEs", event.target.value)} /></Form.Item>
        <Form.Item label="Texto de apoyo" help={error("subtitleEs")} validateStatus={error("subtitleEs") ? "error" : ""}><Input.TextArea rows={4} value={formik.values.subtitleEs} onChange={(event) => formik.setFieldValue("subtitleEs", event.target.value)} /></Form.Item>
      </section>
      <section className="admin-form-section"><header><h3>English</h3><p>Content shown when the site is in English.</p></header>
        <Form.Item label="Title" help={error("titleEn")} validateStatus={error("titleEn") ? "error" : ""}><Input value={formik.values.titleEn} onChange={(event) => formik.setFieldValue("titleEn", event.target.value)} /></Form.Item>
        <Form.Item label="Supporting text" help={error("subtitleEn")} validateStatus={error("subtitleEn") ? "error" : ""}><Input.TextArea rows={4} value={formik.values.subtitleEn} onChange={(event) => formik.setFieldValue("subtitleEn", event.target.value)} /></Form.Item>
      </section>
    </div>
    <Checkbox checked={formik.values.visible} onChange={(event) => formik.setFieldValue("visible", event.target.checked)}>Mostrar esta sección en la portada</Checkbox>
    <Button type="primary" htmlType="submit" loading={formik.isSubmitting}>Guardar sección</Button>
  </form>;
}
