"use client";

import { App, Avatar, Button, ConfigProvider, Drawer, Layout, Menu, Tooltip, Typography } from "antd";
import { AppstoreOutlined, BgColorsOutlined, CustomerServiceOutlined, FileImageOutlined, FileProtectOutlined, HomeOutlined, InboxOutlined, LogoutOutlined, MenuOutlined, PictureOutlined, SettingOutlined, ShoppingOutlined, ShoppingCartOutlined, TagsOutlined, TeamOutlined, ToolOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAdmin } from "@/app/admin/actions";
import { FormExperience } from "@/components/shared/form-experience";

const navigation = [
  ["Resumen", "/admin", HomeOutlined], ["Identidad", "/admin/identidad", BgColorsOutlined], ["Categorías", "/admin/categorias", TagsOutlined], ["Productos", "/admin/productos", ShoppingOutlined], ["Combos", "/admin/combos", AppstoreOutlined], ["Galería", "/admin/galeria", PictureOutlined], ["Servicios", "/admin/servicios", ToolOutlined], ["Solicitudes", "/admin/solicitudes", InboxOutlined], ["Clientes", "/admin/clientes", TeamOutlined], ["Pedidos", "/admin/pedidos", ShoppingCartOutlined], ["Portada", "/admin/inicio", HomeOutlined], ["Multimedia", "/admin/multimedia", FileImageOutlined], ["SEO y políticas", "/admin/seo-politicas", FileProtectOutlined], ["Configuración", "/admin/configuracion", SettingOutlined],
] as const;

export function AdminChrome({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const selected = navigation.find(([, href]) => href === "/admin" ? pathname === "/admin" : pathname.startsWith(href))?.[1] ?? "/admin";
  const items = navigation.map(([label, href, Icon]) => ({ key: href, icon: <Icon />, label }));
  const navigate = (key: string) => { setMenuOpen(false); router.push(key); };
  const user = <div className="admin-ant-user"><Avatar size={38} icon={<CustomerServiceOutlined />} /><div><Typography.Text ellipsis>{email}</Typography.Text><small>Equipo OrosBlooms</small></div><Tooltip title="Cerrar sesión"><form action={logoutAdmin}><Button htmlType="submit" type="text" icon={<LogoutOutlined />} aria-label="Cerrar sesión" /></form></Tooltip></div>;
  return <ConfigProvider theme={{ token: { colorPrimary: "#4b5a43", colorInfo: "#4b5a43", borderRadius: 14, fontFamily: "var(--font-body), Arial, sans-serif", colorBgLayout: "#f4f1ea" }, components: { Menu: { darkItemBg: "#263228", darkItemSelectedBg: "#566851", darkSubMenuItemBg: "#263228" } } }}><FormExperience/><App><Layout className="admin-ant-shell">
    <Layout.Sider className="admin-ant-sider" width={264}><div className="admin-ant-brand"><span>✦</span><div><strong>OrosBlooms</strong><small>Administración</small></div></div><Menu theme="dark" mode="inline" selectedKeys={[selected]} items={items} onClick={({ key }) => navigate(key)} />{user}</Layout.Sider>
    <Layout className="admin-main-layout"><header className="admin-mobile-header"><Button type="text" icon={<MenuOutlined />} aria-label="Abrir menú de administración" onClick={() => setMenuOpen(true)} /><strong>OrosBlooms</strong></header><Layout.Content className="admin-ant-content">{children}</Layout.Content></Layout>
    <Drawer className="admin-mobile-drawer" title="Administración" placement="left" size="min(86vw, 320px)" open={menuOpen} onClose={() => setMenuOpen(false)}><Menu mode="inline" selectedKeys={[selected]} items={items} onClick={({ key }) => navigate(key)} />{user}</Drawer>
  </Layout></App></ConfigProvider>;
}
