# Arquitectura propuesta — OrosBlooms

Estado: arquitectura de foundation implementada en Fase 0; módulos de negocio pendientes.

## Decisiones principales

- Una aplicación Next.js con App Router y TypeScript estricto. El sitio público y el administrador comparten proyecto, despliegue y acceso a datos, pero tienen layouts, componentes y políticas de acceso separados.
- Server Components por defecto. Client Components solo para formularios, filtros, carrito, favoritos y animaciones que requieren interacción.
- PostgreSQL como fuente de verdad; Drizzle ORM para esquema, consultas y migraciones. Las lecturas públicas se centralizan en servicios de servidor. Las escrituras validan entrada con Zod y autorización en el servidor.
- shadcn/ui se incorpora por componentes concretos, especialmente en el administrador; no se instala una biblioteca visual entera sin uso. Tailwind y tokens CSS expresan la marca.
- Imágenes en Cloudinary o proveedor equivalente detrás de un adaptador. PostgreSQL almacena referencias y metadatos, no binarios.
- Moneda inicial CRC; precios en enteros de colones, nunca números de punto flotante. Moneda y reglas de entrega serán configurables.
- Un solo catálogo de productos distinguido por `product.type`: `floral`, `complement` y `personalized`. Flores son la entrada principal; complementos y personalizados pueden venderse por separado cuando el negocio lo requiera, sin crear administraciones paralelas.
- La relación entre arreglo floral y complementos recomendados será explícita y ordenable. No se infiere de la categoría: un ramo de novia puede recomendar opciones distintas a un ramo de cumpleaños.
- El cálculo de regalos y combos quedará en un servicio de dominio: variante floral + complementos seleccionados + cantidades + ajustes aplicables. La UI no será la fuente de verdad del total; pedidos guardarán instantáneas de cada línea.

## Estructura prevista

```text
app/
  (public)/
    layout.tsx
    page.tsx
    flores/  bodas/  eventos/  personalizados/
    galeria/  solicitar/  favoritos/  carrito/  pedido/
    crear-regalo/        # Futuro flujo guiado; no se implementa ahora
  admin/
    layout.tsx
    page.tsx
    solicitudes/ pedidos/ clientes/ productos/ categorias/
    servicios/ galeria/ eventos/ contenido/ inicio/
    testimonios/ configuracion/
  api/                 # Solo endpoints necesarios: uploads, webhooks futuros
  error.tsx loading.tsx not-found.tsx
components/
  shared/              # Primitivas accesibles y estados comunes
  public/              # Presentación editorial y comercio
  admin/               # Navegación, tablas y formularios de operación
db/
  schema/ migrations/  # Esquema Drizzle y migraciones versionadas
lib/                   # Configuración, auth, errores, utilidades puras
schemas/               # Contratos Zod de entrada
services/              # Casos de uso y consultas del servidor
types/                 # Tipos de dominio que no derivan del esquema
public/                # Favicon y recursos estáticos pequeños
docs/
```

Las rutas se crearán cuando su fase lo requiera; esta lista representa el destino, no trabajo de la Fase 0. Los componentes compartidos se extraen al aparecer un segundo uso real. No se expondrán servicios de datos al navegador salvo mediante acciones o endpoints con validación.

## Flujo de datos y seguridad

1. La página de servidor consulta `services` y entrega datos listos para mostrar.
2. Los formularios usan React Hook Form y Zod para respuesta inmediata; el servidor vuelve a validar el mismo contrato antes de escribir.
3. Un servicio ejecuta reglas de negocio y transacciones Drizzle. Los módulos `db` hacen acceso a PostgreSQL.
4. Administración: sesión segura con cookies `HttpOnly`, `Secure` en producción y `SameSite`; comprobación de sesión y rol en cada acción y lectura sensible. Una redirección de ruta mejora UX, pero no sustituye autorización del servidor. Sin registro público de administradores.
5. Uploads: tipo, tamaño y cantidad validados antes de firmar o aceptar el archivo; metadatos y propiedad registrados en DB. No se publican secretos en variables `NEXT_PUBLIC_*`.

La elección concreta de proveedor de autenticación y almacenamiento se cerrará antes de sus fases, con base en despliegue y costos. Fase 0 solo configura contratos y variables necesarias; no simula una autenticación segura.

## UI, rendimiento y SEO

- Layout público editorial y layout administrativo orientado a tareas.
- `next/image` con tamaños explícitos, imágenes responsivas y alternativas accesibles.
- Motion se carga solo en componentes que lo usan. GSAP/ScrollTrigger se evalúa en Fase 26, si Motion resulta insuficiente.
- Metadata base en Fase 0; metadata dinámica, sitemap y datos estructurados en Fase 21.
- Loading, error y not-found globales en Fase 0; límites específicos aparecen junto a cada flujo.

## Dependencias propuestas

| Fase | Paquetes | Motivo |
| --- | --- | --- |
| 0 | `next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `eslint`, configuración ESLint Next, `drizzle-orm`, `drizzle-kit`, `pg`, `zod` | Base, estilos, calidad, persistencia y validación. Se eligió `pg` para Docker local. |
| 1 | `shadcn/ui` mediante CLI y componentes individuales, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` si los componentes elegidos los necesitan | Primitivas visuales reutilizables. |
| 2/26 | `motion`; `gsap` solo si una interacción avanzada lo justifica | Animación progresiva. |
| 8 | `react-hook-form`, `@hookform/resolvers` | Wizard con validación tipada. |
| 9 | Solución de sesión estable compatible con Next.js, elegida entonces | Autenticación y roles. |
| 17 | SDK de Cloudinary o proveedor elegido | Gestión de imágenes. |
| 24 | Herramientas de pruebas unitarias y Playwright | Pruebas sobre flujos ya implementados. |

No se instalarán por adelantado paquetes de fases posteriores. Prettier es opcional si aporta una convención útil frente al formato existente.

## Riesgos y decisiones abiertas

| Riesgo | Tratamiento |
| --- | --- |
| Dependencia del entorno PostgreSQL | Fase 0 usa Docker Compose local, migración versionada y consulta real. Otros entornos deberán aportar `DATABASE_URL`. |
| Catálogo con productos únicos y servicios cotizados | Separar precio base, variantes y solicitudes; permitir “desde” sin forzar compra de servicios. |
| Complementos incompatibles con ciertos arreglos | Asociación explícita de recomendaciones y validación de selección en servidor; evitar una lista global aplicada a todo producto floral. |
| Combos y precios promocionales | Modelar composición y vigencia separadas de productos individuales; preservar líneas y precios acordados en el pedido. |
| Páginas de pedido y clientes antes de auth pública | Definir acceso por token privado o cuenta de cliente antes de implementarlas. Nunca inferir permiso por ID de URL. |
| Información personal e imágenes de inspiración | Minimizar datos, restringir acceso, documentar retención y eliminación antes de capturarlos. |
| Fotografía premium sin material de marca | Usar placeholders autorizados en desarrollo; fotografías finales y derechos de uso deben confirmarse antes de publicar. |
| 28 fases pueden crear dependencias cruzadas | Congelar contratos por fase, registrar cambios de alcance y validar al cerrar cada etapa. |
| Animación y calidad móvil | Medir Core Web Vitals y respetar `prefers-reduced-motion`; no reservar trabajo visual pesado para el arranque. |

## Criterio de Fase 0

Aplicación mínima que arranca y construye, TypeScript y lint limpios, migración aplicada y consulta real a PostgreSQL, documentación actualizada. La landing es solo una comprobación técnica.
