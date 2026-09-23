# Estado actual — OrosBlooms

Fecha: 2026-09-21 (America/Costa_Rica).

## Estado

Fases 0 a 31 completadas. La Fase 27 usa datos de prueba editables desde `/admin/configuracion`: entrega en Oxnard, California; adelanto del 50%; contacto, redes y horario claramente provisionales. Antes de publicar deben sustituirse por información y políticas aprobadas. La base Next.js/PostgreSQL funciona en Docker. La Home pública conserva su composición editorial desktop y móvil, ahora con video local, crossfade amplio y el logo oficial derivado de `public/image.png`. `/design-system` sigue disponible solo en desarrollo.

SEO incluye metadata por ruta, canónicas, Open Graph, sitemap, robots y datos estructurados. Se optimizó la carga del video por viewport, se añadió navegación accesible y animación respetuosa de movimiento reducido. La QA cubrió las rutas públicas principales entre 390 y 1920 px sin desbordamiento horizontal. Hay cinco pruebas unitarias para formato y lógica local del carrito.

La migración `0002_gift_complements_combos.sql` añadió asociaciones de complementos, combos y sus artículos. El detalle floral permite selección múltiple y calcula el total; `/crear-regalo` guía flores, variante, estilo, complementos, dedicatoria, modalidad, fecha y revisión; `/combos` muestra composiciones vigentes. Administración incluye asociaciones y combos. PostgreSQL local confirma 12 recomendaciones, un combo activo y tres artículos de combo.

Las Fases 5 a 20 se ejecutaron como un bloque autorizado. El catálogo `/flores` consulta PostgreSQL, filtra y ordena mediante URL; el detalle muestra variantes y personalización. Se añadieron bodas, eventos, búsqueda, solicitudes con referencias e imágenes privadas, favoritos locales y carrito local sin pasarela. La portada consulta configuración de secciones activas y conserva el orden actual cuando no existe configuración en DB.

`/admin` exige una sesión firmada con rol `admin`; no existe registro público. Incluye dashboard y gestión de productos, galería, solicitudes, clientes, pedidos, portada y multimedia. Cada Server Action administrativa vuelve a comprobar autorización. Producción exige `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET`. Los uploads públicos usan almacenamiento local en desarrollo y las referencias de solicitudes se guardan fuera de `public`; antes de desplegar en infraestructura efímera se debe configurar almacenamiento persistente.

La verificación consolidada pasó `npm run typecheck` y `npm run lint`. Se comprobó manualmente `/flores`, la redirección de `/admin` al acceso y el dashboard autenticado. No se ejecutaron E2E ni una batería por fase, según la solicitud de bajo consumo.

La Fase 4 añadió 20 tablas de negocio (21 contando `foundation_checks`), enums, claves foráneas, índices y restricciones de importes. La migración `0001_flashy_the_renegades.sql` se aplicó a PostgreSQL local. `npm run db:seed` se ejecutó dos veces sin duplicar registros; `npm run db:check-business` confirmó seis categorías, seis productos, seis variantes, cuatro imágenes de producto, dos servicios y una entrada de galería. El testimonio ficticio permanece sin aprobar. Pasaron `npm run typecheck`, `npm run lint` y `npm run build`.

La Fase 1 pasó `npm run typecheck`, `npm run lint` y `npm run build`. Se inspeccionó visualmente la guía en desktop, 390 px y 320 px. A 320 px, las tarjetas de producto pasan a una columna para evitar cortes de precio y botón. No se crearon tests para componentes puramente visuales.

Las Fases 2 y 3 pasaron `npm run typecheck`, `npm run lint` y `npm run build`. La Home se revisó visualmente en desktop, tablet, 390 px y 320 px; el menú móvil abre, cierra y navega a secciones internas. Las fotografías de muestra están optimizadas en WebP y se muestran mediante `next/image`; los precios y productos destacados son ilustrativos. No se crearon E2E ni tests para presentación visual.

El directorio no es todavía un repositorio Git; `git status` no está disponible. No se inicializó Git ni se modificó la base de datos al registrar las decisiones posteriores.

## Decisiones nuevas registradas

- OrosBlooms sigue siendo una marca floral premium. Flores y arreglos dominan fotografía, navegación y jerarquía visual.
- Un catálogo reutilizable distinguirá `floral`, `complement` y `personalized`. Complementos: osos/peluches, chocolates, globos, tarjetas y detalles personalizados, incluidos vasos, termos y artículos Cricut.
- Cada arreglo podrá recomendar complementos compatibles mediante una asociación explícita; el cliente podrá elegir varios. El cálculo de total y los combos se implementarán en fases futuras.
- Se añadió al roadmap `/crear-regalo` como flujo guiado futuro y la administración futura de combos con precio, vigencia y productos incluidos.
- La referencia visual está guardada en `docs/visual-reference.png`. Desktop y móvil tendrán composiciones deliberadas; móvil priorizará búsqueda, categorías horizontales, tarjetas táctiles, filtros en drawer/bottom sheet y navegación inferior cuando corresponda.

## Siguiente paso

Reemplazar desde `/admin/configuracion` el correo, teléfono, redes, horario y políticas de prueba; definir almacenamiento persistente y proveedor de despliegue. E2E continúa pendiente de autorización explícita.

Para cambios solo documentales no se ejecutan tests, lint, TypeScript ni build. E2E se pospone hasta solicitud explícita.
