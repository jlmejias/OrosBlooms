import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/shared/layout";
import { categories, featuredProducts } from "./home-data";
import { Icon } from "./icons";
import { getBusinessSettings } from "@/lib/business";
import { getBrandingSettings } from "@/lib/branding";
import { homepageSectionDefaults, type HomepageSectionKey } from "@/lib/homepage";
import type { Locale } from "@/lib/i18n";
import { formatCRC } from "@/lib/format";

type EditableContent = Record<string, unknown> | undefined;

function copyFor(key: HomepageSectionKey, content: EditableContent, locale: Locale) {
  const fallback = homepageSectionDefaults[key];
  const spanish = locale === "es";
  const value = content ?? {};
  const title = value[spanish ? "titleEs" : "titleEn"] || value[spanish ? "titleEn" : "titleEs"] || fallback[spanish ? "titleEs" : "titleEn"];
  const subtitle = value[spanish ? "subtitleEs" : "subtitleEn"] || value[spanish ? "subtitleEn" : "subtitleEs"] || fallback[spanish ? "subtitleEs" : "subtitleEn"];
  return { title: String(title), subtitle: String(subtitle) };
}
function imagesFor(content:EditableContent,fallback:readonly string[]){const images=content?.images;return Array.isArray(images)?fallback.map((image,index)=>typeof images[index]==="string"&&images[index]?String(images[index]):image):[...fallback]}
function labelsFor(content:EditableContent,fallback:readonly string[]){const labels=content?.imageLabels;return Array.isArray(labels)?fallback.map((label,index)=>typeof labels[index]==="string"&&labels[index]?String(labels[index]):label):[...fallback]}
function socialHref(value:string,network:"instagram"|"facebook"){const trimmed=value.trim();if(!trimmed)return "";if(/^https?:\/\//i.test(trimmed))return trimmed;const handle=trimmed.replace(/^@/,"").replace(/^\/+|\/+$/g,"");return `https://${network}.com/${handle}`}

function SectionIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: { label: string; target: string } }) {
  return <div className="home-section-intro"><div><p className="home-eyebrow">{eyebrow}</p><h2>{title}</h2>{description && <p className="home-section-description">{description}</p>}</div>{action && <a className="home-inline-link" href={action.target}>{action.label}<Icon name="arrow" size={17} /></a>}</div>;
}

export function HomeCategories({locale,content}:{locale:Locale;content?:EditableContent}) {
  const es=locale==="es";
  const copy=copyFor("categories",content,locale);
  const images=imagesFor(content,categories.map(item=>item.image));
  const labels=labelsFor(content,categories.map(item=>item.title));
  return <section id="categorias" className="home-categories home-section"><Container><SectionIntro eyebrow={es?"Encuentra tu momento":"Find your moment"} title={copy.title} description={copy.subtitle} />
    <div className="home-category-rail">{categories.map((category,index) => <a className="home-category" href={category.target} key={category.title}><span className="home-category-image"><Image src={images[index]} alt={labels[index]} fill sizes="(max-width: 768px) 108px, (max-width: 1280px) 14vw, 180px" className="home-cover" /></span><span className="home-category-title">{labels[index]}</span><span className="home-category-more">{es?"Ver inspiración":"Explore inspiration"} <Icon name="arrow" size={14} /></span></a>)}</div>
  </Container></section>;
}

export function HomeStory({locale,content}:{locale:Locale;content?:EditableContent}) {
  const es=locale==="es";
  const copy=copyFor("story",content,locale);
  const[image]=imagesFor(content,["/bouquet-editorial.png"]);return <section id="historia" className="home-story home-section"><Container><div className="home-story-grid"><div className="home-story-image"><Image src={image} alt={es?"Ramo artesanal en tonos rosados y crema":"Handcrafted bouquet in blush and cream tones"} fill sizes="(max-width: 1024px) 100vw, 52vw" className="home-cover" /></div><div className="home-story-copy"><p className="home-eyebrow">{es?"La esencia de OrosBlooms":"The essence of OrosBlooms"}</p><h2>{copy.title}</h2><div className="home-story-rule"/><p>{copy.subtitle}</p><a className="home-inline-link" href="/bodas">{es?"Descubre bodas y eventos":"Discover weddings and events"} <Icon name="arrow" size={18}/></a></div></div></Container></section>;
}

export function HomeFeatured({locale}:{locale:Locale}) {
  const es=locale==="es";
  return <section id="flores" className="home-featured home-section"><Container><SectionIntro eyebrow={es?"Nuestra selección":"Our selection"} title={es?"Flores que dejan huella.":"Flowers that leave a mark."} description={es?"Inspiraciones florales para celebrar, agradecer y acompañar.":"Floral inspiration to celebrate, thank and be present."} action={{label:es?"Ver categorías":"View categories",target:"#categorias"}} />
    <div className="home-featured-grid">{featuredProducts.map((product, index) => <article className="home-product" key={product.name}><div className="home-product-image"><Image src={product.image} alt={product.alt} fill sizes="(max-width: 359px) 90vw, (max-width: 768px) 46vw, (max-width: 1200px) 30vw, 23vw" className="home-cover" />{index === 0 && <span className="home-product-tag">Favorito</span>}</div><div className="home-product-info"><div><h3>{product.name}</h3><p>{product.description}</p></div><span>{product.price}</span></div></article>)}</div>
    <p className="home-product-note">{es?"Fotografías y precios ilustrativos. Los diseños pueden variar según temporada.":"Photos and prices are illustrative. Designs may vary with the season."}</p>
  </Container></section>;
}

type FeaturedProduct={slug:string;name:string;shortDescription:string|null;basePrice:number;image:string|null;imageAlt:string|null};
export function FeaturedProductsSection({locale,content,products}:{locale:Locale;content?:EditableContent;products:FeaturedProduct[]}) {
  const es=locale==="es";
  if(!products.length)return null;
  const copy=copyFor("featuredEditorial",content,locale);
  return <section className="home-editorial-products home-section" aria-labelledby="featured-products-title"><Container><div className="home-editorial-products-layout"><div className="home-editorial-products-copy"><p className="home-eyebrow">{es?"Arreglos destacados":"Featured arrangements"}</p><h2 id="featured-products-title">{copy.title}</h2><p>{copy.subtitle}</p><Link className="home-pill home-pill-dark" href="/flores">{es?"Ver todos los arreglos":"View all arrangements"} <Icon name="arrow" size={17}/></Link></div><div className="home-editorial-product-rail">{products.map(product=><article className="home-editorial-product" key={product.slug}><Link href={`/flores/${product.slug}`}><div className="home-editorial-product-image"><Image src={product.image??"/home-hero.webp"} alt={product.imageAlt??product.name} fill sizes="(max-width: 639px) 78vw, (max-width: 1023px) 42vw, 20vw" className="home-cover"/><span className="home-editorial-heart" aria-hidden="true">♡</span></div><h3>{product.name}</h3><p>{product.shortDescription}</p><strong>{es?"Desde":"From"} {formatCRC(product.basePrice)}</strong><span className="home-editorial-view">{es?"Ver arreglo":"View arrangement"} <Icon name="arrow" size={14}/></span></Link></article>)}</div></div></Container></section>;
}

export function GiftAddonsSection({locale,content}:{locale:Locale;content?:EditableContent}) {
  const es=locale==="es";
  const copy=copyFor("giftAddons",content,locale);
  const[image]=imagesFor(content,["/home-gift-addons.png"]);return <section className="home-gift-addons" aria-labelledby="gift-addons-title"><div className="home-gift-addons-image"><Image src={image} alt={es?"Flores rosadas con chocolates, tarjeta y osito":"Blush flowers with chocolates, a card and teddy bear"} fill sizes="(max-width: 639px) 100vw, 62vw" className="home-cover"/></div><Container className="home-gift-addons-container"><div className="home-gift-addons-copy"><p className="home-eyebrow">{es?"Detalles que completan tu regalo":"Details that complete your gift"}</p><h2 id="gift-addons-title">{copy.title}</h2><p>{copy.subtitle}</p><Link className="home-inline-link" href="/crear-regalo">{es?"Ver complementos":"View extras"} <Icon name="arrow" size={18}/></Link></div></Container></section>;
}

export function HomeWedding({locale}:{locale:Locale}) {
  const es=locale==="es";
  return <section id="bodas" className="home-wedding"><Image src="/home-wedding.webp" alt={es?"Ceremonia de boda decorada con flores blancas":"Wedding ceremony decorated with white flowers"} fill sizes="100vw" className="home-cover"/><div className="home-wedding-shade"/><Container className="home-wedding-content"><p className="home-eyebrow">{es?"Bodas y momentos únicos":"Weddings and unique moments"}</p><h2>{es?<>El día que imaginas.<br/><em>Las flores que lo cuentan.</em></>:<>The day you imagine.<br/><em>Flowers that tell its story.</em></>}</h2><p>{es?"Cada celebración tiene una historia propia. Nos encanta darle forma con flores.":"Every celebration has its own story. We love shaping it with flowers."}</p><a className="home-pill home-pill-light" href="/eventos">{es?"Explorar celebraciones":"Explore celebrations"} <Icon name="arrow" size={17}/></a></Container></section>;
}

export function HomeEvents({locale}:{locale:Locale}) {
  const es=locale==="es";
  return <section id="eventos" className="home-events home-section"><Container><div className="home-events-grid"><div><p className="home-eyebrow">{es?"Celebraciones a tu manera":"Celebrations your way"}</p><h2>{es?<>Momentos que<br/><em>florecen juntos.</em></>:<>Moments that<br/><em>bloom together.</em></>}</h2><p>{es?"Cumpleaños, graduaciones, reuniones y encuentros que merecen recordarse.":"Birthdays, graduations and gatherings worth remembering."}</p><a className="home-inline-link" href="/galeria">{es?"Ver nuestra inspiración":"See our inspiration"} <Icon name="arrow" size={18}/></a></div><div className="home-events-image"><Image src="/home-sunflowers.webp" alt={es?"Ramo de girasoles para una celebración":"Sunflower bouquet for a celebration"} fill sizes="(max-width: 1024px) 100vw, 45vw" className="home-cover"/></div></div></Container></section>;
}

export function HomePersonalized({locale}:{locale:Locale}) {
  const es=locale==="es";
  return <section id="personalizados" className="home-personalized home-section"><Container><div className="home-personalized-panel"><div><p className="home-eyebrow">{es?"Un detalle más":"One more detail"}</p><h2>{es?<>Tu idea.<br/><em>Nuestra inspiración.</em></>:<>Your idea.<br/><em>Our inspiration.</em></>}</h2><p>{es?"Las flores llevan el mensaje. Un detalle personalizado puede hacerlo todavía más tuyo.":"Flowers carry the message. A personalized detail can make it even more yours."}</p><a className="home-inline-link" href="/crear-regalo">{es?"Crear un regalo":"Create a gift"} <Icon name="arrow" size={18}/></a></div><div className="home-personalized-visual"><div className="home-personalized-photo"><Image src="/home-hero.webp" alt={es?"Detalle floral en tonos rosados":"Floral detail in blush tones"} fill sizes="(max-width: 1024px) 80vw, 32vw" className="home-cover"/></div><span>{es?"Detalles que se recuerdan.":"Details to remember."}</span></div></div></Container></section>;
}

type GalleryDisplayItem={url:string;alt:string};
export function HomeGallery({locale,items}:{locale:Locale;items?:GalleryDisplayItem[]}) {
  const es=locale==="es";
  const galleryItems=items?.length?items:[{url:"/home-hero.webp",alt:"Detalle de rosas y peonías rosadas"},{url:"/home-roses.webp",alt:"Ramo de rosas rojas"},{url:"/home-sunflowers.webp",alt:"Ramo de girasoles"},{url:"/home-wedding.webp",alt:"Arco floral en una boda al atardecer"}];
  return <section id="galeria" className="home-gallery home-section"><Container><SectionIntro eyebrow={es?"Instantes OrosBlooms":"OrosBlooms moments"} title={es?"Una mirada a lo que florece.":"A glimpse of what blooms."} description={es?"Texturas, colores y momentos para inspirar tu próxima historia.":"Textures, colors and moments to inspire your next story."} />
    <div className="home-gallery-grid">{galleryItems.slice(0,4).map((item,index)=><div className={`home-gallery-item ${index===0?"home-gallery-tall":""} ${index===3?"home-gallery-wide":""}`} key={`${item.url}-${index}`}><Image src={item.url} alt={item.alt} fill sizes={index===0?"(max-width: 768px) 55vw, 35vw":"(max-width: 768px) 40vw, 25vw"} className="home-cover" /></div>)}</div>
  </Container></section>;
}

export function HomeTestimonial({locale}:{locale:Locale}) {
  const es=locale==="es";
  return <section id="testimonios" className="home-testimonial home-section"><Container><p className="home-eyebrow">{es?"Nuestro compromiso":"Our commitment"}</p><blockquote>{es?"“No hacemos dos momentos iguales.”":"“No two moments are ever the same.”"}</blockquote><p>{es?"Escuchamos tu historia y cuidamos cada elección floral para que el resultado se sienta personal.":"We listen to your story and carefully choose every flower so the result feels personal."}</p></Container></section>;
}

export function HomeFinalCta({locale}:{locale:Locale}) {
  const es=locale==="es";
  return <section id="contacto" className="home-final-cta home-section"><Container><p className="home-eyebrow">{es?"Tu próxima historia":"Your next story"}</p><h2>{es?<>¿Tienes una idea en mente?<br/><em>Hagámosla florecer.</em></>:<>Have an idea in mind?<br/><em>Let us make it bloom.</em></>}</h2><p>{es?"Explora estilos y guarda tus ideas.":"Explore styles and save your ideas."}</p><a className="home-pill home-pill-light" href="/solicitar">{es?"Solicitar diseño":"Request a design"} <Icon name="arrow" size={18}/></a></Container></section>;
}

export async function HomeFooter({locale}:{locale:Locale}) {
  const es=locale==="es";
  const [business,branding] = await Promise.all([getBusinessSettings(),getBrandingSettings()]);
  const instagram=socialHref(business.instagram,"instagram");const facebook=socialHref(business.facebook,"facebook");const whatsapp=business.whatsapp.replace(/\D/g,"");
  return <footer className="home-footer"><Container><div className="home-footer-main"><div><Link href="/" className="home-footer-brand" aria-label={branding.brandName}><Image src={branding.logoUrl} alt={es?branding.logoAltEs:branding.logoAltEn} width={228} height={100} unoptimized/></Link><p>{es?"Más que flores, emociones.":"More than flowers, emotion."}</p><small>{es?"Diseño floral hecho con intención en Oxnard, California.":"Floral design made with intention in Oxnard, California."}</small><a className="home-footer-contact" href={`mailto:${business.email}`}>{business.email}</a><a className="home-footer-contact" href={`tel:${business.phone}`}>{business.phone}</a><div className="home-footer-socials" aria-label={es?"Redes sociales":"Social media"}>{instagram&&<a href={instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram" size={19}/><span>Instagram</span></a>}{facebook&&<a href={facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Icon name="facebook" size={19}/><span>Facebook</span></a>}{whatsapp&&<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp"><span className="home-footer-whatsapp" aria-hidden="true">W</span><span>WhatsApp</span></a>}</div></div><nav aria-label={es?"Enlaces del pie de página":"Footer links"}><Link href="/flores">{es?"Flores":"Flowers"}</Link><Link href="/bodas">{es?"Bodas":"Weddings"}</Link><Link href="/eventos">{es?"Eventos":"Events"}</Link><Link href="/personalizados">{es?"Personalizados":"Personalized"}</Link><Link href="/galeria">{es?"Galería":"Gallery"}</Link><Link href="/crear-regalo">{es?"Crear regalo":"Create a gift"}</Link><Link href="/combos">Combos</Link><Link href="/informacion">{es?"Información":"Information"}</Link><Link href="/legal/privacidad">{es?"Privacidad":"Privacy"}</Link><Link href="/legal/terminos">{es?"Condiciones":"Terms"}</Link></nav></div><div className="home-footer-bottom"><span>© {new Date().getFullYear()} {branding.brandName}</span><span>{es?"Hecho para momentos que se recuerdan":"Made for moments to remember"}</span></div></Container></footer>;
}
