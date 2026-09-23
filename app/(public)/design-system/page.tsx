import { notFound } from "next/navigation";
import { Badge, Chip } from "@/components/shared/badge";
import { Button, IconButton } from "@/components/shared/button";
import { Card, CategoryCard, GalleryCard, ImageCard, ProductCard } from "@/components/shared/cards";
import { TextAreaField, TextField } from "@/components/shared/form-field";
import { Container, Section, SectionHeader } from "@/components/shared/layout";
import { EmptyState, LoadingState } from "@/components/shared/states";

const colors = [
  ["Fondo cálido", "#FAF8F4", "bg-background"],
  ["Texto", "#292B25", "bg-foreground"],
  ["Crema", "#F1EBE1", "bg-cream"],
  ["Blush", "#D8B8B5", "bg-blush"],
  ["Salvia", "#A8B5A1", "bg-sage"],
  ["Oliva", "#59654D", "bg-olive"],
  ["Burgundy", "#744448", "bg-burgundy"],
] as const;

const typeSamples = [
  ["Display XL", "type-display-xl", "Flores que cuentan historias"],
  ["Display LG", "type-display-lg", "Momentos que florecen"],
  ["H1", "type-h1", "Diseños que hacen sentir"],
  ["H2", "type-h2", "Cada detalle importa"],
  ["H3", "type-h3", "Un regalo para recordar"],
  ["Body LG", "type-body-lg", "Flores frescas para los momentos que merecen quedarse."],
  ["Body", "type-body", "Creamos arreglos únicos con un cuidado especial por cada flor."],
  ["Small", "type-small", "Disponible según temporada y frescura de las flores."],
  ["Caption", "type-caption", "Flores para cada historia"],
] as const;

const bouquetAlt = "Ramo de rosas y peonías rosadas con flores blancas y follaje salvia";

export default function DesignSystemPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <main className="overflow-x-hidden">
    <div className="border-b border-border bg-surface"><Container className="flex min-h-16 items-center justify-between gap-4"><span className="font-serif text-2xl font-semibold">OrosBlooms<span className="text-burgundy">✽</span></span><Badge tone="sage">Vista de desarrollo</Badge></Container></div>

    <Section className="bg-cream py-12 sm:py-20"><Container>
      <div className="grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <div><p className="type-caption mb-5 text-olive">Sistema visual · Fase 1</p><h1 className="type-display-lg max-w-2xl">Flores para cada historia.</h1><p className="type-body-lg mt-6 max-w-md text-muted">Una guía de color, tipografía y componentes para una experiencia floral cálida, clara y cuidadosamente diseñada.</p><div className="mt-8 flex flex-wrap gap-3"><Button>Acción principal</Button><Button variant="outline">Acción secundaria</Button></div></div>
        <ImageCard ratio="landscape" alt={bouquetAlt} className="min-h-72 lg:min-h-[480px]" />
      </div>
    </Container></Section>

    <Section><Container><SectionHeader eyebrow="01 · Fundamentos" title="Paleta de la marca" description="Flores como protagonistas, con acentos suaves y superficies cálidas." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">{colors.map(([name, hex, color]) => <div key={name}><div className={`aspect-[4/3] rounded-2xl border border-border ${color}`} /><p className="mt-3 text-sm font-medium">{name}</p><p className="mt-1 text-xs text-muted">{hex}</p></div>)}</div>
    </Container></Section>

    <Section className="bg-surface"><Container><SectionHeader eyebrow="02 · Tipografía" title="Una voz editorial" description="Serif para emoción y storytelling; sans para navegación, datos y decisiones." />
      <div className="divide-y divide-border">{typeSamples.map(([label, style, sample]) => <div key={label} className="grid gap-3 py-5 sm:grid-cols-[140px_1fr] sm:items-baseline sm:py-7"><span className="type-caption text-muted">{label}</span><p className={style}>{sample}</p></div>)}</div>
    </Container></Section>

    <Section><Container><SectionHeader eyebrow="03 · Acciones" title="Botones, chips y señales" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-6 sm:p-8"><h3 className="type-h3">Acciones</h3><div className="mt-6 flex flex-wrap gap-3"><Button>Explorar flores</Button><Button variant="secondary">Solicitar diseño</Button><Button variant="outline">Ver detalles</Button><Button variant="ghost">Más opciones</Button><IconButton label="Guardar favorito" icon={<HeartIcon />} /></div><p className="mt-6 text-sm text-muted">Área táctil cómoda, foco visible y estados claros.</p></Card>
        <Card className="p-6 sm:p-8"><h3 className="type-h3">Selección y estado</h3><div className="hide-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2"><Chip selected>Todos</Chip><Chip>Rosas</Chip><Chip>Peonías</Chip><Chip>Tulipanes</Chip></div><div className="mt-6 flex flex-wrap gap-2"><Badge tone="floral">Floral</Badge><Badge tone="sage">Disponible</Badge><Badge>Personalizado</Badge></div></Card>
      </div>
    </Container></Section>

    <Section className="bg-blush-soft/60"><Container><SectionHeader eyebrow="04 · Imágenes y tarjetas" title="Las flores llevan la mirada" description="Proporciones estables para composiciones editoriales y tarjetas táctiles." />
      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><ImageCard ratio="landscape" alt={bouquetAlt} className="min-h-72" /><div className="grid grid-cols-2 gap-4"><CategoryCard name="Ramos" alt={bouquetAlt} /><CategoryCard name="Celebraciones" alt={bouquetAlt} /></div></div>
      <h3 className="type-h3 mt-12 mb-5">Tarjetas de producto</h3><div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:gap-5 lg:grid-cols-4"><ProductCard name="Ramo Aurora" description="Rosas suaves y flores de temporada." price="Desde ₡28.000" alt={bouquetAlt} badge="Favorito" /><ProductCard name="Jardín Rosado" description="Una composición delicada para celebrar." price="Desde ₡32.000" alt={bouquetAlt} /><ProductCard name="Luz de Primavera" description="Texturas naturales y tonos cálidos." price="Desde ₡26.000" alt={bouquetAlt} /><ProductCard name="Peonías de Amor" description="Un gesto romántico y memorable." price="Desde ₡35.000" alt={bouquetAlt} /></div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2"><GalleryCard title="Detalles que inspiran" detail="Galería floral" alt={bouquetAlt} /><GalleryCard title="Una historia en flores" detail="Bodas y eventos" alt={bouquetAlt} /></div>
    </Container></Section>

    <Section><Container><SectionHeader eyebrow="05 · Formularios" title="Pedir con claridad" description="Campos legibles y espacio suficiente para escribir desde el móvil." />
      <div className="grid gap-8 lg:grid-cols-[1fr_.8fr]"><Card className="p-6 sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><TextField id="example-name" label="Nombre" placeholder="Tu nombre" /><TextField id="example-email" label="Correo electrónico" type="email" placeholder="nombre@ejemplo.com" /></div><div className="mt-5"><TextAreaField id="example-message" label="Cuéntanos tu idea" placeholder="Imagina tu momento especial…" /></div><div className="mt-6"><Button disabled>Vista de formulario</Button></div></Card><div className="grid gap-5"><EmptyState title="Todavía no hay favoritos" description="Guarda los arreglos que te emocionen para encontrarlos fácilmente." action={<Button variant="outline">Explorar flores</Button>} /><LoadingState label="Cargando arreglos de muestra" /></div></div>
    </Container></Section>

    <Section className="bg-olive text-white"><Container><p className="type-caption text-white/75">Principio de marca</p><p className="type-display-lg mt-5 max-w-4xl">Más que flores, emociones.</p><p className="mt-6 max-w-xl text-white/85">Los complementos acompañan; el arreglo floral sigue siendo el centro de cada historia.</p></Container></Section>
  </main>;
}

function HeartIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg>;
}
