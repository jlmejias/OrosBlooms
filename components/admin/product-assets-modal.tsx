"use client";

import { Modal } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { DraggableModal } from "./draggable-modal";

export function ProductAssetsModal({ productName, children }: { productName: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  return <Modal className="admin-product-assets-modal" title={`Variantes e imágenes · ${productName}`} open onCancel={() => router.replace(pathname)} footer={null} destroyOnHidden width={1100} modalRender={modal => <DraggableModal>{modal}</DraggableModal>}>
    {children}
  </Modal>;
}
