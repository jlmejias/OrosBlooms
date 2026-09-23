"use client";

import { DeleteOutlined, SearchOutlined, SaveOutlined } from "@ant-design/icons";
import { App, Button, Input, Popconfirm, Select, Space, Table, Tag, Tooltip } from "antd";
import { useMemo, useState } from "react";
import { deleteInquiry, deleteOrder, reviewOrderPayment, saveOrder, updateInquiry } from "@/app/admin/actions";
import { formatCRC } from "@/lib/format";

type Inquiry = { id: string; reference: string; status: string; type: string; notes: string | null; internalNotes: string | null; createdAt: string; customer: string; phone: string | null };
type Order = { id: string; reference: string; status: string; total: number; customer: string; paymentMethod: string | null; paymentStatus: string; paymentProofAssetId: string | null };
const inquiryLabels: Record<string, string> = { new: "Nueva", reviewing: "En revisión", quoting: "Cotizando", quoted: "Cotizada", approved: "Aprobada", rejected: "Rechazada", completed: "Completada" };
const orderLabels: Record<string, string> = { draft: "Borrador", pending: "Pendiente", confirmed: "Confirmado", preparing: "Preparando", ready: "Listo", delivered: "Entregado", cancelled: "Cancelado" };
const inquiryStatuses = Object.entries(inquiryLabels).map(([value, label]) => ({ value, label }));
const orderStatuses = Object.entries(orderLabels).map(([value, label]) => ({ value, label }));
const paymentLabels: Record<string, string> = { unpaid: "Sin pagar", pending_review: "Por revisar", paid: "Pagado", failed: "Rechazado", refunded: "Reembolsado" };

export function InquiryTable({ items }: { items: Inquiry[] }) {
  const { message } = App.useApp();
  const [query, setQuery] = useState(""); const [status, setStatus] = useState<string>();
  const [changes, setChanges] = useState<Record<string, { status: string; notes: string }>>({});
  const [savingId, setSavingId] = useState<string>(); const [deletingId, setDeletingId] = useState<string>();
  const data = useMemo(() => items.filter(item => (!status || item.status === status) && `${item.reference} ${item.customer} ${item.phone ?? ""} ${item.type}`.toLowerCase().includes(query.toLowerCase())), [items, query, status]);
  const save = async (item: Inquiry) => { setSavingId(item.id); try { const edit = changes[item.id] ?? { status: item.status, notes: item.internalNotes ?? "" }; const form = new FormData(); form.set("id", item.id); form.set("status", edit.status); form.set("internalNotes", edit.notes); await updateInquiry(form); message.success("Solicitud actualizada."); } catch (error) { message.error(error instanceof Error ? error.message : "No se pudo actualizar la solicitud."); } finally { setSavingId(undefined); } };
  const remove = async (id: string) => { setDeletingId(id); try { const form = new FormData(); form.set("id", id); await deleteInquiry(form); message.success("Solicitud eliminada."); } catch (error) { message.error(error instanceof Error ? error.message : "No se pudo eliminar la solicitud."); } finally { setDeletingId(undefined); } };
  return <><Toolbar query={query} setQuery={setQuery} placeholder="Buscar referencia, cliente o tipo"><Select placeholder="Todos los estados" value={status} onChange={setStatus} options={inquiryStatuses} allowClear/></Toolbar><Table rowKey="id" dataSource={data} pagination={{ pageSize: 10, showSizeChanger: true }} scroll={{ x: 900 }} columns={[
    { title: "Referencia", dataIndex: "reference", render: (value, item) => <>{value}<br/><small>{new Date(item.createdAt).toLocaleDateString("es-CR")}</small></> },
    { title: "Cliente", dataIndex: "customer", render: (value, item) => <>{value}<br/><small>{item.phone}</small></> },
    { title: "Solicitud", dataIndex: "type", render: (value, item) => <>{value}<br/><small>{item.notes}</small></> },
    { title: "Estado", render: (_, item) => <Select disabled={savingId === item.id || deletingId === item.id} style={{ minWidth: 145 }} value={changes[item.id]?.status ?? item.status} options={inquiryStatuses} onChange={value => setChanges(current => ({ ...current, [item.id]: { status: value, notes: current[item.id]?.notes ?? item.internalNotes ?? "" } }))}/> },
    { title: "Nota interna", render: (_, item) => <Input.TextArea disabled={savingId === item.id || deletingId === item.id} placeholder="Escribe una nota interna" value={changes[item.id]?.notes ?? item.internalNotes ?? ""} onChange={event => setChanges(current => ({ ...current, [item.id]: { status: current[item.id]?.status ?? item.status, notes: event.target.value } }))}/> },
    { title: "Acciones", fixed: "right", render: (_, item) => <Space><Tooltip title="Guardar"><Button shape="circle" type="text" loading={savingId === item.id} disabled={Boolean(deletingId)} icon={<SaveOutlined/>} onClick={() => save(item)}/></Tooltip><Popconfirm title="Eliminar solicitud" description="Esta acción no se puede deshacer." okText="Eliminar" cancelText="Cancelar" okButtonProps={{ danger: true, loading: deletingId === item.id }} onConfirm={() => remove(item.id)}><Button shape="circle" type="text" danger loading={deletingId === item.id} disabled={Boolean(savingId)} icon={<DeleteOutlined/>}/></Popconfirm></Space> },
  ]}/></>;
}

export function OrderTable({ items }: { items: Order[] }) {
  const { message } = App.useApp();
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState<string>();
  const [changes, setChanges] = useState<Record<string, string>>({}); const [savingId, setSavingId] = useState<string>(); const [deletingId, setDeletingId] = useState<string>(); const [reviewingId, setReviewingId] = useState<string>();
  const data = useMemo(() => items.filter(item => (!filter || item.status === filter) && `${item.reference} ${item.customer}`.toLowerCase().includes(query.toLowerCase())), [items, query, filter]);
  const save = async (item: Order) => { setSavingId(item.id); try { const form = new FormData(); form.set("id", item.id); form.set("status", changes[item.id] ?? item.status); await saveOrder(form); message.success("Pedido actualizado."); } catch (error) { message.error(error instanceof Error ? error.message : "No se pudo actualizar el pedido."); } finally { setSavingId(undefined); } };
  const remove = async (id: string) => { setDeletingId(id); try { const form = new FormData(); form.set("id", id); await deleteOrder(form); message.success("Pedido eliminado."); } catch (error) { message.error(error instanceof Error ? error.message : "No se pudo eliminar el pedido."); } finally { setDeletingId(undefined); } };
  const reviewPayment = async (id: string, paymentStatus: "paid" | "failed") => { setReviewingId(id); try { const form = new FormData(); form.set("id", id); form.set("paymentStatus", paymentStatus); await reviewOrderPayment(form); message.success(paymentStatus === "paid" ? "Pago confirmado." : "Pago rechazado."); } catch (error) { message.error(error instanceof Error ? error.message : "No se pudo actualizar el pago."); } finally { setReviewingId(undefined); } };
  return <><Toolbar query={query} setQuery={setQuery} placeholder="Buscar pedido o cliente"><Select placeholder="Todos los estados" value={filter} onChange={setFilter} options={orderStatuses} allowClear/></Toolbar><Table rowKey="id" dataSource={data} pagination={{ pageSize: 10, showSizeChanger: true }} columns={[
    { title: "Pedido", dataIndex: "reference", render: (value, item) => <>{value}<br/><small>{item.customer}</small></> }, { title: "Total", dataIndex: "total", render: value => formatCRC(value) },
    { title: "Estado", render: (_, item) => <Select disabled={savingId === item.id || deletingId === item.id} style={{ minWidth: 150 }} value={changes[item.id] ?? item.status} options={orderStatuses} onChange={value => setChanges(current => ({ ...current, [item.id]: value }))}/> },
    { title: "Situación", dataIndex: "status", render: value => <Tag color={value === "cancelled" ? "red" : value === "delivered" ? "green" : "default"}>{orderLabels[value]}</Tag> },
    { title: "Pago", render: (_, item) => <Space direction="vertical" size={3}><Tag color={item.paymentStatus === "paid" ? "green" : item.paymentStatus === "pending_review" ? "gold" : item.paymentStatus === "failed" ? "red" : "default"}>{paymentLabels[item.paymentStatus] ?? item.paymentStatus}</Tag>{item.paymentMethod && <small>{item.paymentMethod === "sinpe" ? "SINPE Móvil" : "Tarjeta"}</small>}{item.paymentProofAssetId && <a href={`/api/private-media/${item.paymentProofAssetId}`} target="_blank" rel="noreferrer">Ver comprobante</a>}{item.paymentStatus === "pending_review" && <Space><Popconfirm title="Confirmar pago" description="¿Confirmas que el comprobante corresponde a este pedido?" okText="Confirmar" cancelText="Cancelar" onConfirm={() => reviewPayment(item.id, "paid")}><Button size="small" type="primary" loading={reviewingId === item.id}>Confirmar</Button></Popconfirm><Popconfirm title="Rechazar comprobante" description="El cliente tendrá que enviar un comprobante válido." okText="Rechazar" cancelText="Cancelar" okButtonProps={{ danger: true }} onConfirm={() => reviewPayment(item.id, "failed")}><Button size="small" danger disabled={reviewingId === item.id}>Rechazar</Button></Popconfirm></Space>}</Space> },
    { title: "Acciones", render: (_, item) => <Space><Tooltip title="Guardar"><Button shape="circle" type="text" loading={savingId === item.id} disabled={Boolean(deletingId)} icon={<SaveOutlined/>} onClick={() => save(item)}/></Tooltip><Popconfirm title="Eliminar pedido" description="Esta acción no se puede deshacer." okText="Eliminar" cancelText="Cancelar" okButtonProps={{ danger: true, loading: deletingId === item.id }} onConfirm={() => remove(item.id)}><Button shape="circle" type="text" danger loading={deletingId === item.id} disabled={Boolean(savingId)} icon={<DeleteOutlined/>}/></Popconfirm></Space> },
  ]}/></>;
}

function Toolbar({ query, setQuery, placeholder, children }: { query: string; setQuery: (value: string) => void; placeholder: string; children: React.ReactNode }) {
  return <div className="admin-table-toolbar"><Input prefix={<SearchOutlined/>} placeholder={placeholder} value={query} onChange={event => setQuery(event.target.value)} allowClear/>{children}</div>;
}
