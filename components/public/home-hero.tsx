import { Icon } from "./icons";
import { HeroMedia } from "./hero-media";
import type { Locale } from "@/lib/i18n";
import type { BrandingSettings } from "@/lib/branding";
import type { HeroCopy } from "@/lib/hero-copy";

const lines=(value:string)=>value.split("\n").map((line,index)=><span key={`${line}-${index}`}>{line}{index<value.split("\n").length-1&&<br/>}</span>);
export function HomeHero({locale,branding,copy}:{locale:Locale;branding:BrandingSettings;copy:HeroCopy}) {
  const es=locale==="es";
  const primaryHref=copy.primaryHref==="#flores"?"/flores":copy.primaryHref||"/flores";
  const storyHref=copy.secondaryHref||"#historia";
  const text={eyebrow:es?copy.eyebrowEs:copy.eyebrowEn,title:es?copy.titleEs:copy.titleEn,emphasis:es?copy.emphasisEs:copy.emphasisEn,description:es?copy.descriptionEs:copy.descriptionEn,primary:es?copy.primaryLabelEs:copy.primaryLabelEn,secondary:es?copy.secondaryLabelEs:copy.secondaryLabelEn,aside:es?copy.asideEs:copy.asideEn};
  const media={videoUrl:branding.heroVideoUrl,imageUrl:branding.heroImageUrl,imageAlt:es?branding.heroImageAltEs:branding.heroImageAltEn};
  return <section id="inicio" className="home-hero" aria-labelledby="home-title">
    <div className="home-hero-desktop">
      <div className="home-hero-copy">
        <p className="home-eyebrow">{text.eyebrow}</p>
        <h1 id="home-title">{text.title}<br/><em>{text.emphasis}</em></h1>
        <p className="home-hero-description">{lines(text.description)}</p>
        <div className="home-hero-actions"><a className="home-pill home-pill-dark" href={primaryHref}>{text.primary} <Icon name="arrow" size={17}/></a><a className="home-text-link" href={storyHref}>{text.secondary} <Icon name="arrow" size={17}/></a></div>
        <p className="home-hero-aside">{text.aside}</p>
      </div>
      <div className="home-hero-visual"><HeroMedia {...media}/></div>
    </div>
    <div className="home-hero-mobile">
      <HeroMedia mobile {...media}/>
      <div className="home-hero-mobile-copy"><p className="home-eyebrow">{text.eyebrow}</p><h1>{text.title}<br/><em>{text.emphasis}</em></h1><p>{lines(text.description)}</p><a className="home-pill home-pill-dark" href={primaryHref}>{text.primary} <Icon name="arrow" size={17}/></a></div>
      <div className="home-hero-mobile-tag">{es?"Hecho con intención · Costa Rica":"Made with intention · Oxnard, California"}</div>
    </div>
  </section>;
}
