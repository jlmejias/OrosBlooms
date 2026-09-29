import Image from "next/image";
import Link from "next/link";
import type { PageContent, PageFeature, PageImage } from "@/lib/service-page";

type ServiceVariant = "weddings" | "events" | "personalized";

const fallbackImages: Record<ServiceVariant, string> = {
  weddings: "/home-wedding.webp",
  events: "/home-sunflowers.webp",
  personalized: "/home-hero.webp",
};

type Copy = {
  kicker: string;
  title: string;
  description: string;
  detailKicker: string;
  detailTitle: string;
  detailOne: string;
  detailTwo: string;
  primaryCta: string;
  heroAside: string;
  alt: string;
  features: Array<{ title: string; description: string; icon: PageFeature["icon"] }>;
};

export function ServicePageLayout({ variant, locale, page, images, ctaHref }: { variant: ServiceVariant; locale: "es" | "en"; page: PageContent; images: PageImage[]; ctaHref: string }) {
  const copy = localizedCopy(page, locale);
  const gallery = images.length ? images : [{ id: "fallback", url: fallbackImages[variant] }];
  const image = (index: number) => gallery[index] ?? gallery[0];

  if (variant === "weddings") return <WeddingsLayout copy={copy} image={image} ctaHref={ctaHref} />;
  if (variant === "events") return <EventsLayout copy={copy} image={image} ctaHref={ctaHref} />;
  return <PersonalizedLayout copy={copy} image={image} ctaHref={ctaHref} />;
}

function WeddingsLayout({ copy, image, ctaHref }: { copy: Copy; image: (index: number) => PageImage; ctaHref: string }) {
  return <div className="service-composition service-composition-weddings">
    <header className="weddings-hero">
      <div className="weddings-hero-copy">
        <p className="commerce-kicker">{copy.kicker}</p><h1>{copy.title}</h1><p>{copy.description}</p>
        <div className="service-actions"><Link className="home-pill home-pill-dark" href={ctaHref}>{copy.primaryCta}<span aria-hidden="true">→</span></Link></div>
      </div>
      <div className="weddings-hero-image"><Image src={image(0).url} alt={copy.alt} fill priority sizes="(max-width: 760px) 100vw, 62vw"/></div>
    </header>
    <section className="weddings-editorial" id="detalle">
      <div className="weddings-editorial-image"><Image src={image(1).url} alt={copy.alt} fill sizes="(max-width: 760px) 100vw, 52vw"/></div>
      <div className="weddings-editorial-copy"><p className="commerce-kicker">{copy.detailKicker}</p><h2>{copy.detailTitle}</h2><p>{copy.detailOne}</p>{copy.detailTwo&&<p>{copy.detailTwo}</p>}<FeatureList features={copy.features}/></div>
    </section>
  </div>;
}

function EventsLayout({ copy, image, ctaHref }: { copy: Copy; image: (index: number) => PageImage; ctaHref: string }) {
  return <div className="service-composition service-composition-events" id="detalle"><section className="events-stage">
    <div className="events-copy"><div className="events-hero-copy"><p className="commerce-kicker">{copy.kicker}</p><h1>{copy.title}</h1><p className="events-intro">{copy.description}</p><div className="service-actions"><Link className="home-pill home-pill-dark" href={ctaHref}>{copy.primaryCta}<span aria-hidden="true">→</span></Link></div></div><div className="events-editorial-copy"><div className="events-rule"/><p className="commerce-kicker">{copy.detailKicker}</p><h2>{copy.detailTitle}</h2><p>{copy.detailOne}</p>{copy.detailTwo&&<p>{copy.detailTwo}</p>}<FeatureList features={copy.features}/></div></div>
    <div className="events-image"><Image src={image(0).url} alt={copy.alt} fill priority sizes="(max-width: 760px) 100vw, 48vw"/></div>
  </section></div>;
}

function PersonalizedLayout({ copy, image, ctaHref }: { copy: Copy; image: (index: number) => PageImage; ctaHref: string }) {
  return <div className="service-composition service-composition-personalized">
    <header className="personalized-heading"><div><p className="commerce-kicker">{copy.kicker}</p><h1>{copy.title}</h1><p>{copy.description}</p></div><aside><div className="personalized-heading-aside-image"><Image src={image(1).url} alt={copy.alt} fill sizes="76px"/></div><p>{copy.heroAside}</p></aside></header>
    <section className="personalized-stage" id="detalle"><div className="personalized-copy"><div className="personalized-editorial-copy"><p className="commerce-kicker">{copy.detailKicker}</p><h2>{copy.detailTitle}</h2><p>{copy.detailOne}</p>{copy.detailTwo&&<p>{copy.detailTwo}</p>}</div><FeatureCards features={copy.features} image={image} alt={copy.alt}/><div className="service-actions personalized-actions"><Link className="home-pill home-pill-dark" href={ctaHref}>{copy.primaryCta}<span aria-hidden="true">→</span></Link></div></div><div className="personalized-image"><Image src={image(0).url} alt={copy.alt} fill priority sizes="(max-width: 760px) 100vw, 52vw"/></div></section>
  </div>;
}

function FeatureList({ features }: { features: Copy["features"] }) { return <div className="service-feature-list">{features.map((feature,index)=><article key={`${feature.title}-${index}`}><span><ServiceIcon name={feature.icon}/></span><div><h3>{feature.title}</h3><p>{feature.description}</p></div></article>)}</div>; }
function FeatureCards({ features, image, alt }: { features: Copy["features"]; image: (index: number) => PageImage; alt: string }) { return <div className="personalized-feature-cards">{features.map((feature,index)=><article key={`${feature.title}-${index}`}><div><Image src={image(index+2).url} alt={`${alt}: ${feature.title}`} fill sizes="(max-width: 760px) 28vw, 14vw"/></div><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div>; }

function localizedCopy(page: PageContent, locale: "es" | "en"): Copy {
  const es = locale === "es";
  const features = page.features?.length ? page.features : [] as PageFeature[];
  return { kicker: es ? page.kickerEs : page.kickerEn, title: es ? page.titleEs : page.titleEn, description: es ? page.descriptionEs : page.descriptionEn, detailKicker: es ? page.detailKickerEs : page.detailKickerEn, detailTitle: es ? page.detailTitleEs : page.detailTitleEn, detailOne: es ? page.detailBodyOneEs : page.detailBodyOneEn, detailTwo: es ? page.detailBodyTwoEs : page.detailBodyTwoEn, primaryCta: es ? page.ctaLabelEs : page.ctaLabelEn, heroAside: es ? page.heroAsideEs : page.heroAsideEn, alt: es ? page.imageAltEs : page.imageAltEn, features: features.map(feature=>({title:es?feature.titleEs:feature.titleEn,description:es?feature.descriptionEs:feature.descriptionEn,icon:feature.icon??"flower"})) };
}

function ServiceIcon({ name }: { name: PageFeature["icon"] }) {
  const paths: Record<PageFeature["icon"], React.ReactNode> = {
    bouquet: <><path d="M12 21V11M8 21h8M7 9c0-2 2-4 5-6 3 2 5 4 5 6 0 3-2 5-5 5s-5-2-5-5Z"/><path d="M9 7 6 4M15 7l3-3"/></>,
    arch: <><path d="M5 21V11a7 7 0 0 1 14 0v10M3 21h18M9 21v-8a3 3 0 0 1 6 0v8"/></>,
    table: <><path d="M4 10h16M6 10l1 10M18 10l-1 10M4 14h16M9 7h6"/></>,
    gift: <><path d="M4 10h16v11H4zM3 7h18v4H3zM12 7v14M12 7H8a2 2 0 1 1 2-3c1 1 2 3 2 3Zm0 0h4a2 2 0 1 0-2-3c-1 1-2 3-2 3Z"/></>,
    stem: <><path d="M12 21V10M12 15c-4 0-6-2-7-5 4 0 6 2 7 5Zm0-3c4 0 6-2 7-5-4 0-6 2-7 5ZM12 10c-2-2-2-5 0-7 2 2 2 5 0 7Z"/></>,
    flower: <><path d="M12 21v-7M12 14c-3 0-5-2-5-5 3 0 5 2 5 5Zm0 0c3 0 5-2 5-5-3 0-5 2-5 5Zm0-2c-2-2-2-5 0-7 2 2 2 5 0 7Z"/><circle cx="12" cy="10" r="2"/></>,
    chocolate: <><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M5 10h14M10 5v14"/></>,
    bear: <><circle cx="12" cy="13" r="6"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="10" cy="12" r=".5"/><circle cx="14" cy="12" r=".5"/><path d="M10 15c1 1 3 1 4 0"/></>,
    card: <><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M7 10h10M7 14h6"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
