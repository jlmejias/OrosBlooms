"use client";

import { App, Avatar, Button, ConfigProvider, Layout, Menu, Tooltip, Typography } from "antd";
import { AppstoreOutlined, BgColorsOutlined, CustomerServiceOutlined, FileImageOutlined, FileProtectOutlined, GiftOutlined, HomeOutlined, InboxOutlined, LogoutOutlined, PictureOutlined, SettingOutlined, ShoppingOutlined, ShoppingCartOutlined, TeamOutlined, ToolOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";

const navigation=[
  ["Resumen","/admin",HomeOutlined],["Identidad","/admin/identidad",BgColorsOutlined],["Productos","/admin/productos",ShoppingOutlined],["Complementos","/admin/complementos",GiftOutlined],["Combos","/admin/combos",AppstoreOutlined],["Galería","/admin/galeria",PictureOutlined],["Servicios","/admin/servicios",ToolOutlined],["Solicitudes","/admin/solicitudes",InboxOutlined],["Clientes","/admin/clientes",TeamOutlined],["Pedidos","/admin/pedidos",ShoppingCartOutlined],["Portada","/admin/inicio",HomeOutlined],["Multimedia","/admin/multimedia",FileImageOutlined],["SEO y políticas","/admin/seo-politicas",FileProtectOutlined],["Configuración","/admin/configuracion",SettingOutlined],
] as const;

export function AdminChrome({email,children}:{email:string;children:React.ReactNode}){
  const pathname=usePathname(); const router=useRouter();
  const selected=navigation.find(([,href])=>href==="/admin"?pathname==="/admin":pathname.startsWith(href))?.[1]??"/admin";
  return <ConfigProvider theme={{ token: { colorPrimary: "#4b5a43", colorInfo: "#4b5a43", borderRadius: 14, fontFamily: "var(--font-body), Arial, sans-serif", colorBgLayout: "#f4f1ea" }, components: { Menu: { darkItemBg: "#263228", darkItemSelectedBg: "#566851", darkSubMenuItemBg: "#263228" } } }}><App><Layout className="admin-ant-shell"><Layout.Sider className="admin-ant-sider" width={264} breakpoint="lg" collapsedWidth={0}><div className="admin-ant-brand"><span>✦</span><div><strong>OrosBlooms</strong><small>Administración</small></div></div><Menu theme="dark" mode="inline" selectedKeys={[selected]} items={navigation.map(([label,href,Icon])=>({key:href,icon:<Icon/>,label}))} onClick={({key})=>router.push(key)}/><div className="admin-ant-user"><Avatar size={38} icon={<CustomerServiceOutlined/>}/><div><Typography.Text ellipsis>{email}</Typography.Text><small>Equipo OrosBlooms</small></div><Tooltip title="Cerrar sesión"><form action={logoutAdmin}><Button htmlType="submit" type="text" icon={<LogoutOutlined/>} aria-label="Cerrar sesión"/></form></Tooltip></div></Layout.Sider><Layout><Layout.Content className="admin-ant-content">{children}</Layout.Content></Layout></Layout></App></ConfigProvider>;
}
