"use client";

import { BarChartOutlined, CheckOutlined, ClockCircleOutlined, DeleteOutlined, FileTextOutlined, SearchOutlined, SaveOutlined, SendOutlined, TruckOutlined, UserOutlined } from "@ant-design/icons";
import { App, Button, Input, Popconfirm, Select, Space, Table, Tag, Tooltip } from "antd";
import { useMemo, useState } from "react";
import { deleteInquiry, deleteOrder, resendPaymentReviewEmail, reviewOrderPayment, saveOrder, updateInquiry } from "@/app/admin/actions";
import { formatCRC } from "@/lib/format";
import { inquiryTransitions, orderTransitions } from "@/lib/workflow";

type Inquiry = { id: string; reference: string; status: keyof typeof inquiryTransitions; type: string; notes: string | null; internalNotes: string | null; notificationStatus: string; notificationError: string | null; createdAt: string; customer: string; phone: string | null };
type Order = { id: string; reference: string; status: string; total: number; deposit: number; balance: number; createdAt: string; customer: string; email: string | null; paymentMethod: string | null; paymentStatus: string; paymentProofAssetId: string | null };

const inquiryLabels: Record<string, string> = { new: "Nueva", reviewing: "En revisión", quoting: "Cotizando", quoted: "Cotizada", approved: "Aprobada", rejected: "Rechazada", completed: "Completada" };
const orderLabels: Record<string, string> = { draft: "Borrador", pending: "Pendiente", confirmed: "Confirmado", preparing: "Preparando", ready: "Listo", delivered: "Entregado", cancelled: "Cancelado" };
const paymentLabels: Record<string, string> = { unpaid: "Sin pagar", pending_review: "Por revisar", paid: "Pagado", failed: "Rechazado", refunded: "Reembolsado" };
const inquiryStatuses = Object.entries(inquiryLabels).map(([value, label]) => ({ value, label }));
const orderStatuses = Object.entries(orderLabels).map(([value, label]) => ({ value, label }));

export function InquiryTable({ items }: { items: Inquiry[] }) {
  const { message } = App.useApp();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>();
  const [changes, setChanges] = useState<Record<string, { status: string; notes: string }>>({});
  const [savingId, setSavingId] = useState<string>();
  const [deletingId, setDeletingId] = useState<string>();
  const data = useMemo(() => items.filter(item => (!status || item.status === status) && `${item.reference} ${item.customer} ${item.phone ?? ""} ${item.type}`.toLowerCase().includes(query.toLowerCase())), [items, query, status]);
  const save = async (item: Inquiry) => { setSavingId(item.id); try { const edit = changes[item.id] ?? { status: item.status, notes: item.internalNotes ?? "" }; const form = new FormData(); form.set("id", item.id); form.set("status", edit.status); form.set("internalNotes", edit.notes); await updateInquiry(form); message.success("Solicitud actualizada."); } catch (error) { message.error(error instanceof Error ? error.message : "No se pudo actualizar la solicitud."); } finally { setSavingId(undefined); } };
  const remove = async (id: string) => { setDeletingId(id); try { const form = new FormData(); form.set("id", id); await deleteInquiry(form); message.success("Solicitud eliminada."); } catch (error) { message.error(error instanceof Error ? error.message : "No se pudo eliminar la solicitud."); } finally { setDeletingId(undefined); } };

  return <><Toolbar query={query} setQuery={setQuery} placeholder="Buscar referencia, cliente o tipo"><Select placeholder="Todos los estados" value={status} onChange={setStatus} options={inquiryStatuses} allowClear/></Toolbar><Table rowKey="id" dataSource={data} pagination={{ pageSize: 10, showSizeChanger: true }} scroll={{ x: 900 }} columns={[
    { title: "Referencia", dataIndex: "reference", render: (value, item) => <>{value}<br/><small>{new Date(item.createdAt).toLocaleDateString("es-CR")}</small></> },
    { title: "Cliente", dataIndex: "customer", render: (value, item) => <>{value}<br/><small>{item.phone}</small></> },
    { title: "Solicitud", dataIndex: "type", render: (value, item) => <>{value}<br/><small>{item.notes}</small></> },
    { title: "Estado", render: (_, item) => <Select disabled={savingId === item.id || deletingId === item.id} style={{ minWidth: 145 }} value={changes[item.id]?.status ?? item.status} options={inquiryStatuses.filter(option => option.value === item.status || inquiryTransitions[item.status].includes(option.value as never))} onChange={value => setChanges(current => ({ ...current, [item.id]: { status: value, notes: current[item.id]?.notes ?? item.internalNotes ?? "" } }))}/> },
    { title: "Aviso", render: (_, item) => <Tooltip title={item.notificationError ?? undefined}><Tag color={item.notificationStatus === "sent" ? "green" : item.notificationStatus === "failed" ? "red" : "gold"}>{item.notificationStatus === "sent" ? "Email enviado" : item.notificationStatus === "failed" ? "Email falló" : "Email pendiente"}</Tag></Tooltip> },
    { title: "Nota interna", render: (_, item) => <Input.TextArea disabled={savingId === item.id || deletingId === item.id} placeholder="Escribe una nota interna" value={changes[item.id]?.notes ?? item.internalNotes ?? ""} onChange={event => setChanges(current => ({ ...current, [item.id]: { status: current[item.id]?.status ?? item.status, notes: event.target.value } }))}/> },
    { title: "Acciones", fixed: "right", render: (_, item) => <Space><Tooltip title="Guardar"><Button aria-label={`Guardar solicitud ${item.reference}`} shape="circle" type="text" loading={savingId === item.id} disabled={Boolean(deletingId)} icon={<SaveOutlined/>} onClick={() => save(item)}/></Tooltip><Popconfirm title="Eliminar solicitud" description="Esta acción no se puede deshacer." okText="Eliminar" cancelText="Cancelar" okButtonProps={{ danger: true, loading: deletingId === item.id }} onConfirm={() => remove(item.id)}><Button aria-label={`Eliminar solicitud ${item.reference}`} shape="circle" type="text" danger loading={deletingId === item.id} disabled={Boolean(savingId)} icon={<DeleteOutlined/>}/></Popconfirm></Space> },
  ]}/>;</>
}

function orderTone(status: string) {
  if (status === "confirmed" || status === "delivered") return "success";
  if (status === "preparing" || status === "ready") return "active";
  if (status === "cancelled") return "danger";
  return "pending";
}

function paymentMethodLabel(method: string | null) {
  if (method === "zelle") return "Zelle";
  if (method === "sinpe") return "SINPE Móvil";
  if (method === "card") return "Tarjeta";
  return "Sin método";
}

function MetricCard({ icon, value, label, tone }: { icon: React.ReactNode; value: string | number; label: string; tone: string }) {
  return <article className={`order-metric-card is-${tone}`}><span className="order-metric-icon">{icon}</span><span><strong>{value}</strong><small>{label}</small></span></article>;
}

export function OrderTable({ items }: { items: Order[] }) {
  const { message, modal } = App.useApp();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>();
  const [paymentFilter, setPaymentFilter] = useState<string>();
  const [changes, setChanges] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string>();
  const [deletingId, setDeletingId] = useState<string>();
  const [reviewingId, setReviewingId] = useState<string>();
  const [notifyingId, setNotifyingId] = useState<string>();
  const data = useMemo(() => items.filter(item => {
    const matchesQuery = `${item.reference} ${item.customer} ${item.email ?? ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (!statusFilter || item.status === statusFilter) && (!paymentFilter || item.paymentStatus === paymentFilter);
  }), [items, paymentFilter, query, statusFilter]);
  const metrics = useMemo(() => ({
    pending: items.filter(item => item.status === "draft" || item.status === "pending").length,
    preparing: items.filter(item => item.status === "preparing").length,
    confirmed: items.filter(item => item.status === "confirmed").length,
    income: items.filter(item => item.paymentStatus === "paid").reduce((sum, item) => sum + item.deposit, 0),
  }), [items]);
  const persistStatus = async (item: Order, nextStatus: string) => { setSavingId(item.id); try { const form = new FormData(); form.set("id", item.id); form.set("status", nextStatus); const result = await saveOrder(form); if (nextStatus === "preparing") { if (result.emailSent) message.success("Pedido actualizado. Correo enviado al cliente."); else message.warning("Pedido actualizado, pero no se pudo enviar el correo al cliente."); } else message.success("Estado del pedido actualizado."); } catch (error) { message.error(error instanceof Error ? error.message : "No se pudo actualizar el pedido."); } finally { setSavingId(undefined); } };
  const save = (item: Order) => { const nextStatus = changes[item.id] ?? item.status; if (nextStatus === item.status) return; const notifying = nextStatus === "preparing"; modal.confirm({ title: notifying ? "Confirmar preparación del pedido" : "Confirmar cambio de estado", content: <>¿Deseas cambiar el estado de <strong>{item.reference}</strong> de <strong>{orderLabels[item.status] ?? item.status}</strong> a <strong>{orderLabels[nextStatus] ?? nextStatus}</strong>?{notifying && <><br/><br/><strong>Se enviará un correo al cliente</strong> para avisarle que ya estamos preparando su pedido.</>}</>, okText: notifying ? "Cambiar y notificar" : "Cambiar estado", cancelText: "Cancelar", onOk: () => persistStatus(item, nextStatus) }); };
  const remove = async (id: string) => { setDeletingId(id); try { const form = new FormData(); form.set("id", id); await deleteOrder(form); message.success("Pedido eliminado."); } catch (error) { message.error(error instanceof Error ? error.message : "No se pudo eliminar el pedido."); } finally { setDeletingId(undefined); } };
  const persistPaymentReview = async (item: Order, paymentStatus: "paid" | "failed") => { setReviewingId(item.id); try { const form = new FormData(); form.set("id", item.id); form.set("paymentStatus", paymentStatus); const result = await reviewOrderPayment(form); if (!result.changed) { message.info("El pago ya había sido revisado."); return; } if (result.emailSent) message.success(paymentStatus === "paid" ? "Pago confirmado. Correo enviado al cliente." : "Pago rechazado. Cliente notificado por correo."); else message.warning(paymentStatus === "paid" ? "Pago confirmado, pero no se pudo enviar el correo al cliente." : "Pago rechazado, pero no se pudo notificar al cliente por correo."); } catch (error) { message.error(error instanceof Error ? error.message : "No se pudo actualizar el pago."); } finally { setReviewingId(undefined); } };
  const reviewPayment = (item: Order, paymentStatus: "paid" | "failed") => { const next = paymentLabels[paymentStatus]; modal.confirm({ title: paymentStatus === "paid" ? "Confirmar pago" : "Rechazar comprobante", content: <>¿Deseas cambiar el pago de <strong>{item.reference}</strong> de <strong>{paymentLabels[item.paymentStatus] ?? item.paymentStatus}</strong> a <strong>{next}</strong>?{paymentStatus === "paid" ? " Se enviará un correo al cliente." : " Se solicitará un nuevo comprobante al cliente."}</>, okText: paymentStatus === "paid" ? "Confirmar pago" : "Rechazar pago", cancelText: "Cancelar", okButtonProps: paymentStatus === "failed" ? { danger: true } : undefined, onOk: () => persistPaymentReview(item, paymentStatus) }); };
  const resendPaymentEmail = (item: Order) => { modal.confirm({ title: "Reenviar correo al cliente", content: <>¿Deseas reenviar la notificación de <strong>{paymentLabels[item.paymentStatus] ?? item.paymentStatus}</strong> para el pedido <strong>{item.reference}</strong>?</>, okText: "Reenviar correo", cancelText: "Cancelar", onOk: async () => { setNotifyingId(item.id); try { const form = new FormData(); form.set("id", item.id); const result = await resendPaymentReviewEmail(form); if (result.emailSent) message.success("Correo reenviado al cliente."); else message.warning("No se pudo enviar el correo al cliente."); } catch (error) { message.error(error instanceof Error ? error.message : "No se pudo reenviar el correo."); } finally { setNotifyingId(undefined); } } }); };

  return <section className="order-dashboard">
    <div className="order-dashboard-toolbar">
      <Input prefix={<SearchOutlined/>} placeholder="Buscar pedido, cliente o número de referencia..." value={query} onChange={event => setQuery(event.target.value)} allowClear/>
      <Select placeholder="Todos los estados" value={statusFilter} onChange={setStatusFilter} options={orderStatuses} allowClear/>
      <Select placeholder="Todos los pagos" value={paymentFilter} onChange={setPaymentFilter} options={Object.entries(paymentLabels).map(([value, label]) => ({ value, label }))} allowClear/>
    </div>
    <div className="order-dashboard-metrics">
      <MetricCard icon={<ClockCircleOutlined/>} value={metrics.pending} label="Pendientes" tone="pending"/>
      <MetricCard icon={<TruckOutlined/>} value={metrics.preparing} label="Preparando" tone="active"/>
      <MetricCard icon={<CheckOutlined/>} value={metrics.confirmed} label="Confirmados" tone="success"/>
      <MetricCard icon={<BarChartOutlined/>} value={formatCRC(metrics.income)} label="Ingresos confirmados" tone="income"/>
    </div>
    <div className="order-table-card">
      <Table className="orders-table" rowKey="id" dataSource={data} pagination={{ pageSize: 10, showSizeChanger: true }} scroll={{ x: 1220 }} columns={[
        { title: "Pedido", dataIndex: "reference", width: 180, render: (value, item: Order) => <div className="order-reference"><strong>{value}</strong><small>{new Date(item.createdAt).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" })}</small></div> },
        { title: "Cliente", dataIndex: "customer", width: 205, render: (value, item: Order) => <div className="order-customer"><UserOutlined/><span><strong>{value}</strong><small>{item.email ?? "Sin correo electrónico"}</small></span></div> },
        { title: "Total", dataIndex: "total", width: 105, render: value => <strong className="order-total">{formatCRC(value)}</strong> },
        { title: "Estado", width: 170, render: (_, item: Order) => { const value = changes[item.id] ?? item.status; return <span className={`order-status-control is-${orderTone(value)}`}><i/><Select aria-label={`Estado del pedido ${item.reference}`} disabled={savingId === item.id || deletingId === item.id} value={value} options={orderStatuses.filter(option => option.value === item.status || orderTransitions[item.status as keyof typeof orderTransitions].includes(option.value as never))} onChange={next => setChanges(current => ({ ...current, [item.id]: next }))}/></span>; } },
        { title: "Situación", dataIndex: "status", width: 132, render: value => <span className={`order-situation is-${orderTone(value)}`}>{orderLabels[value] ?? value}</span> },
        { title: "Pago", width: 265, render: (_, item: Order) => <div className="order-payment"><span className={`order-payment-badge is-${item.paymentStatus}`}>{item.paymentStatus === "paid" && item.balance > 0 ? "Adelanto pagado" : paymentLabels[item.paymentStatus] ?? item.paymentStatus}</span><small>{paymentMethodLabel(item.paymentMethod)}</small>{item.balance > 0 && <small>Adelanto: {formatCRC(item.deposit)} · Saldo: {formatCRC(item.balance)}</small>}{item.paymentProofAssetId && <a href={`/api/private-media/${item.paymentProofAssetId}`} target="_blank" rel="noreferrer"><FileTextOutlined/> Ver comprobante</a>}{item.paymentStatus === "pending_review" && <Space size={5}><Button size="small" type="primary" loading={reviewingId === item.id} onClick={() => reviewPayment(item, "paid")}>Confirmar</Button><Button size="small" danger loading={reviewingId === item.id} disabled={Boolean(reviewingId)} onClick={() => reviewPayment(item, "failed")}>Rechazar</Button></Space>}{["paid", "failed"].includes(item.paymentStatus) && <Button className="order-resend-email" type="link" size="small" icon={<SendOutlined/>} loading={notifyingId === item.id} onClick={() => resendPaymentEmail(item)}>Reenviar correo</Button>}</div> },
        { title: "Acciones", width: 125, fixed: "right", render: (_, item: Order) => <Space size={7}><Tooltip title="Guardar cambios"><Button aria-label={`Guardar pedido ${item.reference}`} className="order-icon-action" shape="circle" type="text" loading={savingId === item.id} disabled={Boolean(deletingId)} icon={<SaveOutlined/>} onClick={() => save(item)}/></Tooltip><Popconfirm title={`Eliminar pedido ${item.reference}`} description="Esta acción no se puede deshacer." okText="Eliminar" cancelText="Cancelar" okButtonProps={{ danger: true, loading: deletingId === item.id }} onConfirm={() => remove(item.id)}><Button aria-label={`Eliminar pedido ${item.reference}`} className="order-icon-action is-danger" shape="circle" type="text" loading={deletingId === item.id} disabled={Boolean(savingId)} icon={<DeleteOutlined/>}/></Popconfirm></Space> },
      ]}/>
    </div>
  </section>;
}

function Toolbar({ query, setQuery, placeholder, children }: { query: string; setQuery: (value: string) => void; placeholder: string; children: React.ReactNode }) {
  return <div className="admin-table-toolbar"><Input prefix={<SearchOutlined/>} placeholder={placeholder} value={query} onChange={event => setQuery(event.target.value)} allowClear/>{children}</div>;
}
