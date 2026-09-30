"use client";

import { App, Button, Modal } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteOrphanedPrivateImage, deleteOrphanedPublicImage } from "@/app/admin/actions";

export function OrphanImageAction({ pathname, visibility }: { pathname: string; visibility: "public" | "private" }) {
  const { message } = App.useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    try {
      const form = new FormData();
      form.set("pathname", pathname);
      await (visibility === "public" ? deleteOrphanedPublicImage : deleteOrphanedPrivateImage)(form);
      setOpen(false);
      message.success("Archivo eliminado.");
      router.refresh();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "No se pudo eliminar el archivo.");
    } finally {
      setDeleting(false);
    }
  }

  return <>
    <Button danger onClick={() => setOpen(true)}>Eliminar</Button>
    <Modal open={open} title="Eliminar archivo huérfano" okText="Eliminar" okButtonProps={{ danger: true }} confirmLoading={deleting} onOk={remove} onCancel={() => !deleting && setOpen(false)}>
      <p>Se borrará definitivamente {pathname} del almacenamiento.</p>
    </Modal>
  </>;
}
