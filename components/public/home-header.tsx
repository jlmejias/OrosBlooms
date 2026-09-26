"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { useStore } from "@/components/commerce/store-provider";
import type { Locale } from "@/lib/i18n";

export function HomeHeader({locale,logoUrl="/orosblooms-logo.png",logoAlt="OrosBlooms"}:{locale:Locale;logoUrl?:string;logoAlt?:string}) {
  const { cart } = useStore();
  const nav=locale==="es"?[["Inicio","/"],["Flores","/flores"],["Bodas","/bodas"],["Eventos","/eventos"],["Personalizados","/personalizados"],["Galería","/galeria"]] as const:[["Home","/"],["Flowers","/flores"],["Weddings","/bodas"],["Events","/eventos"],["Personalized","/personalizados"],["Gallery","/galeria"]] as const;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  return <header className={`home-header ${scrolled ? "is-scrolled" : ""}`}>
    <div className="home-header-inner">
      <button className="home-icon-button home-menu-trigger" type="button" aria-label={menuOpen?(locale==="es"?"Cerrar menú":"Close menu"):(locale==="es"?"Abrir menú":"Open menu")} aria-expanded={menuOpen} aria-controls="home-mobile-menu" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} size={23} /></button>
      <Link href="/" className="home-brand home-brand-logo" onClick={() => setMenuOpen(false)}><Image src={logoUrl} alt={logoAlt} width={210} height={66} priority unoptimized /></Link>
      <nav className="home-desktop-nav" aria-label={locale==="es"?"Navegación principal":"Main navigation"}>{nav.map(([label, href]) => <Link className={isActive(href) ? "is-active" : undefined} aria-current={isActive(href) ? "page" : undefined} href={href} key={label}>{label}</Link>)}</nav>
      <div className="home-header-actions"><a className="home-search-desktop" href="/buscar" aria-label={locale==="es"?"Buscar flores y ocasiones":"Search flowers and occasions"}><Icon name="search" size={18} /><span>{locale==="es"?"Explorar flores y ocasiones":"Explore flowers and occasions"}</span></a><button className="language-switch" type="button" onClick={()=>{document.cookie=`oros-locale=${locale==="es"?"en":"es"};path=/;max-age=31536000;SameSite=Lax`;window.location.reload()}} aria-label={locale==="es"?"Cambiar a inglés":"Cambiar a español"}>{locale==="es"?"EN":"ES"}</button><a className="home-icon-button" href="/favoritos" aria-label={locale==="es"?"Favoritos":"Favorites"}><Icon name="heart" /></a><a className="home-icon-button home-cart-button" href="/carrito" aria-label={locale==="es"?"Carrito":"Cart"}><Icon name="bag" />{cartCount>0&&<span className="cart-count-badge">{cartCount}</span>}</a></div>
      <a className="home-icon-button home-mobile-bag home-cart-button" href="/carrito" aria-label={locale==="es"?"Carrito":"Cart"}><Icon name="bag" size={22} />{cartCount>0&&<span className="cart-count-badge">{cartCount}</span>}</a>
    </div>
    <a href="/buscar" className="home-mobile-search" aria-label={locale==="es"?"Buscar flores y ocasiones":"Search flowers and occasions"}><Icon name="search" size={18} /><span>{locale==="es"?"Explorar flores y ocasiones...":"Explore flowers and occasions..."}</span></a>
    {menuOpen && <nav id="home-mobile-menu" className="home-mobile-menu" aria-label={locale==="es"?"Menú móvil":"Mobile menu"}>{nav.map(([label, href]) => <Link className={isActive(href) ? "is-active" : undefined} aria-current={isActive(href) ? "page" : undefined} href={href} key={label} onClick={() => setMenuOpen(false)}>{label}<Icon name="arrow" size={16} /></Link>)}<button className="mobile-language-switch" type="button" onClick={()=>{document.cookie=`oros-locale=${locale==="es"?"en":"es"};path=/;max-age=31536000;SameSite=Lax`;window.location.reload()}}>{locale==="es"?"English":"Español"}</button></nav>}
  </header>;
}

export function MobileBottomNav({locale}:{locale:Locale}) {
  const pathname = usePathname();
  const entries = locale==="es"?[["Inicio","/","home"],["Flores","/flores","flower"],["Favoritos","/favoritos","heart"],["Carrito","/carrito","bag"]] as const:[["Home","/","home"],["Flowers","/flores","flower"],["Favorites","/favoritos","heart"],["Cart","/carrito","bag"]] as const;
  return <nav className="home-bottom-nav" aria-label={locale==="es"?"Navegación inferior":"Bottom navigation"}>{entries.map(([label, href, icon]) => { const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`); return <Link className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined} href={href} key={label}><Icon name={icon} size={20} /><span>{label}</span></Link>; })}</nav>;
}
