import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { orphanedPrivateBlobs, orphanedPublicBlobs } from "@/lib/media-maintenance";
import { OrphanImageAction } from "@/components/admin/orphan-image-action";
import { publicBlobUrl } from "@/lib/blob";

export default async function MediaCleanupPage() {
  await requireAdmin();
  const [publicFiles, privateFiles] = await Promise.all([orphanedPublicBlobs(), orphanedPrivateBlobs()]);
  const images = [
    ...publicFiles.map(file => ({ ...file, visibility: "public" as const })),
    ...privateFiles.map(file => ({ ...file, visibility: "private" as const })),
  ];
  return <main className="admin-media-cleanup">
    <header className="admin-head"><div>
      <p><Link href="/admin/multimedia">← Volver a Multimedia</Link></p>
      <h1>Limpieza de archivos visuales</h1>
      <p>Archivos públicos y privados sin registro ni uso detectado. Los subidos durante la última hora no aparecen aquí.</p>
    </div></header>
    <section className="admin-panel">
      <h2>{images.length} {images.length === 1 ? "archivo para revisar" : "archivos para revisar"}</h2>
      {images.length === 0 ? <p>No hay archivos huérfanos detectados.</p> :
        <div className="product-table-workspace"><section className="product-table-card">
          <table className="admin-table product-table"><thead><tr><th>Archivo</th><th>Tipo</th><th>Tamaño</th><th>Subido</th><th>Acción</th></tr></thead>
            <tbody>{images.map(image => <tr key={`${image.visibility}/${image.pathname}`}>
              <td>{image.pathname}{image.visibility === "public" && <><br/><a href={publicBlobUrl(image.pathname)} target="_blank" rel="noreferrer">Ver archivo ↗</a></>}</td>
              <td>{image.visibility === "public" ? "Público" : "Privado"}</td>
              <td>{(image.bytes / 1024 / 1024).toFixed(2)} MB</td>
              <td>{image.modifiedAt.toLocaleDateString("es-CR")}</td>
              <td><OrphanImageAction pathname={image.pathname} visibility={image.visibility}/></td>
            </tr>)}</tbody>
          </table>
        </section></div>}
    </section>
  </main>;
}
