import { count, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/admin-data-table";
import { db } from "@/db/client";
import { customers, inquiries, orders, products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin-auth";
import { getVisitorAnalytics } from "@/lib/visitor-analytics";

export default async function AdminDashboard() {
  await requireAdmin();
  const [[productCount], [inquiryCount], [orderCount], [customerCount], recent, analytics] = await Promise.all([
    db.select({ value: count() }).from(products).where(eq(products.status, "active")),
    db.select({ value: count() }).from(inquiries),
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(customers),
    db.select({ reference: inquiries.reference, status: inquiries.status, createdAt: inquiries.createdAt }).from(inquiries).orderBy(sql`${inquiries.createdAt} desc`).limit(6),
    getVisitorAnalytics(),
  ]);
  const statusOptions = [...new Set(recent.map(item => item.status))].map(value => ({ value, label: value }));

  return <>
    <header className="admin-head"><div><h1>Resumen</h1><p>Actividad de OrosBlooms.</p></div><Link className="admin-button" href="/admin/solicitudes">Ver solicitudes</Link></header>
    <section className="admin-stats">
      <article className="admin-stat"><span>Productos activos</span><strong>{productCount.value}</strong></article>
      <article className="admin-stat"><span>Solicitudes</span><strong>{inquiryCount.value}</strong></article>
      <article className="admin-stat"><span>Pedidos</span><strong>{orderCount.value}</strong></article>
      <article className="admin-stat"><span>Clientes</span><strong>{customerCount.value}</strong></article>
    </section>
    <section className="admin-analytics" aria-labelledby="analytics-title">
      <header><div><p className="admin-analytics-kicker">Analíticas</p><h2 id="analytics-title">Visitas al sitio</h2><p>Datos anónimos de navegación. Un visitante se reconoce mediante una cookie segura durante 30 días.</p></div></header>
      <div className="admin-stats admin-analytics-stats">
        <article className="admin-stat"><span>Visitantes únicos hoy</span><strong>{analytics.today.visitors}</strong><small>{analytics.today.views} {analytics.today.views === 1 ? "visita" : "visitas"}</small></article>
        <article className="admin-stat"><span>Visitantes únicos · 7 días</span><strong>{analytics.sevenDays.visitors}</strong><small>{analytics.sevenDays.views} {analytics.sevenDays.views === 1 ? "visita" : "visitas"}</small></article>
        <article className="admin-stat"><span>Visitantes únicos · 30 días</span><strong>{analytics.thirtyDays.visitors}</strong><small>{analytics.thirtyDays.views} {analytics.thirtyDays.views === 1 ? "visita" : "visitas"}</small></article>
      </div>
      <div className="admin-analytics-pages">
        <h3>Páginas más visitadas · últimos 30 días</h3>
        {analytics.topPages.length ? <table className="admin-table"><thead><tr><th>Página</th><th>Visitas</th><th>Visitantes</th></tr></thead><tbody>{analytics.topPages.map(page => <tr key={page.path}><td>{page.path === "/" ? "Portada" : page.path}</td><td>{page.views}</td><td>{page.visitors}</td></tr>)}</tbody></table> : <p>Aún no hay visitas registradas.</p>}
      </div>
    </section>
    <div className="admin-dashboard-list"><AdminDataTable columns={["Referencia", "Estado", "Fecha", "Acciones"]} rows={recent.map(item => ({ id: item.reference, cells: [{ primary: item.reference }, { primary: item.status, tone: item.status === "completed" || item.status === "approved" ? "active" as const : item.status === "rejected" ? "inactive" as const : "warning" as const }, item.createdAt.toLocaleDateString("es-CR")], filterValue: item.status }))} noun="solicitudes" searchPlaceholder="Buscar solicitudes recientes..." filterPlaceholder="Todos los estados" filterOptions={statusOptions}/></div>
  </>;
}
