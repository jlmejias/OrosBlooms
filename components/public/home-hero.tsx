import { Icon } from "./icons";
import { HeroMedia } from "./hero-media";
import type { Locale } from "@/lib/i18n";
import type { BrandingSettings } from "@/lib/branding";

export function HomeHero({locale,branding}:{locale:Locale;branding:BrandingSettings}) {
  const es=locale==="es";
  const media={videoUrl:branding.heroVideoUrl,imageUrl:branding.heroImageUrl,imageAlt:es?branding.heroImageAltEs:branding.heroImageAltEn};
  return <section id="inicio" className="home-hero" aria-labelledby="home-title">
    <div className="home-hero-desktop">
      <div className="home-hero-copy">
        <p className="home-eyebrow">{es?"Flores para cada historia":"Flowers for every story"}</p>
        <h1 id="home-title">{es?<>Diseños que<br/><em>hacen sentir.</em></>:<>Designs that<br/><em>make you feel.</em></>}</h1>
        <p className="home-hero-description">{es?<>Arreglos únicos para momentos reales.<br/>Flores frescas, emociones duraderas.</>:<>Unique arrangements for real moments.<br/>Fresh flowers, lasting emotions.</>}</p>
        <div className="home-hero-actions"><a className="home-pill home-pill-dark" href="#flores">{es?"Explorar diseños":"Explore designs"} <Icon name="arrow" size={17}/></a><a className="home-text-link" href="#historia">{es?"Nuestra historia":"Our story"} <Icon name="arrow" size={17}/></a></div>
        <p className="home-hero-aside">{es?"Más que flores, momentos.":"More than flowers, moments."}</p>
      </div>
      <div className="home-hero-visual"><HeroMedia {...media}/></div>
    </div>
    <div className="home-hero-mobile">
      <HeroMedia mobile {...media}/>
      <div className="home-hero-mobile-copy"><p className="home-eyebrow">{es?"Flores para cada historia":"Flowers for every story"}</p><h1>{es?<>Más que flores,<br/><em>emociones.</em></>:<>More than flowers,<br/><em>emotion.</em></>}</h1><p>{es?"Diseños que hacen sentir.":"Designs that make you feel."}</p><a className="home-pill home-pill-dark" href="#flores">{es?"Explorar flores":"Explore flowers"} <Icon name="arrow" size={17}/></a></div>
      <div className="home-hero-mobile-tag">{es?"Hecho con intención · Costa Rica":"Made with intention · Oxnard, California"}</div>
    </div>
  </section>;
}
