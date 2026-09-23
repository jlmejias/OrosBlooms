# Hoja de ruta — OrosBlooms

Estado: Fases 0 a 31 completadas. La Fase 27 usa datos de prueba editables desde `/admin/configuracion`; antes de publicar deben sustituirse por datos comerciales y legales aprobados. Las Fases 21 a 31 se ejecutaron como bloque autorizado; pruebas unitarias, TypeScript, lint, build, migración y QA responsive pasaron. E2E continúa diferido por decisión previa.

| Fase | Entrega principal | Verificación de cierre |
| --- | --- | --- |
| 0 | Foundation: Next.js, TS strict, Tailwind, estructura, Drizzle, entorno, boundaries, metadata, landing mínima | Arranque, build, TS, lint, migración y consulta DB reales. |
| 1 | Tokens, tipografía, componentes base y `/design-system` de desarrollo | Preview accesible, responsive y tokens consistentes. |
| 2 | Home editorial desktop | Secciones solicitadas, imágenes optimizadas y movimiento reducido. |
| 3 | Experiencia móvil propia | Navegación, hero, categorías y patrones táctiles revisados. |
| 4 | Esquema del negocio, migraciones y seed; `product.type` floral/complement/personalized | Integridad referencial y seed repetible. |
| 5 | Catálogo `/flores` con flores protagonistas | Filtros en URL, orden y estados vacíos en desktop/móvil. |
| 6 | Detalle `/flores/[slug]`; espacio previsto para complementos | Variantes y personalización; recomendaciones se activan en fase futura. |
| 7 | Bodas y eventos | Storytelling, galerías y CTA claros. |
| 8 | Wizard `/solicitar` | Validación, imágenes, persistencia y referencia. |
| 9 | Autenticación administrativa | Rutas y acciones protegidas por rol; sin registro público. |
| 10 | Dashboard administrador | Métricas, solicitudes y acciones útiles. |
| 11 | Gestión de productos | CRUD, variantes, fotos y borrado seguro. |
| 12 | Gestión de galería | Crear, ordenar y destacar trabajos. |
| 13 | Gestión de solicitudes | Detalle, estados y notas internas. |
| 14 | Clientes | Historial consolidado sin CRM excesivo. |
| 15 | Pedidos | Flujo de cotización a entrega, saldos y estados. |
| 16 | CMS de portada | Secciones reordenables y campañas programables. |
| 17 | Biblioteca multimedia | Upload, búsqueda, reutilización y metadatos. |
| 18 | Búsqueda pública | Productos, categorías, ocasiones y servicios. |
| 19 | Favoritos | Local y DB cuando exista identidad de cliente. |
| 20 | Carrito | Variantes, personalización y totales; sin pasarela. |
| 21 | SEO y marketing | Metadata, sitemap, robots y datos estructurados. |
| 22 | Rendimiento | Auditoría CWV y optimización de recursos. |
| 23 | Accesibilidad | Teclado, foco, contraste, etiquetas y movimiento. |
| 24 | Testing | Unit e integración para lógica; E2E con DB aislada solo si el usuario lo solicita explícitamente. |
| 25 | QA responsive | Revisión manual de 320 a 1920 px. |
| 26 | Animación premium | Storytelling avanzado medido y accesible. |
| 27 | Configuración del negocio | Contacto, redes, horario, entrega y legales. |
| 28 | Preparación de producción | Seguridad, backup, migraciones y `DEPLOYMENT.md`. |
| 29 (futura) | Complementos por arreglo, cálculo de total y administración de asociaciones | Compatibilidad por producto, selección múltiple, precios y persistencia probados. |
| 30 (futura) | `/crear-regalo`: flores, tamaño, estilo/color, complementos, dedicatoria, entrega/retiro, fecha, revisión y confirmación | Flujo guiado responsive, validación y total consistente. |
| 31 (futura) | Combos administrables con productos, imagen, precio/promoción, vigencia, destacado y activo | Composición y vigencia verificadas sin alterar precios individuales. |

## Dependencias de planificación

- La Fase 0 ya confirmó PostgreSQL de desarrollo mediante Docker, migración y consulta real.
- El modelo floral/complement/personalized se concreta en Fase 4 sin crear tres sistemas de administración. Las recomendaciones, el constructor de regalos y los combos quedan para fases posteriores autorizadas.
- E2E queda diferido hasta solicitud explícita del usuario; no instalar Playwright por ahora.
- El contenido fotográfico final, derechos de uso y datos reales del negocio se necesitarán antes de publicar páginas definitivas.
- La Fase 19 exige definir identidad de cliente: la Fase 9 solo autentica al administrador. Si aún no existe login de clientes, se completa almacenamiento local y se deja la sincronización DB para una fase autorizada que añada cuentas de cliente.
- La privacidad de `/pedido/[id]` requiere una decisión explícita de acceso antes de mostrar información personal.
- Las pruebas comienzan en cada fase según su riesgo; la Fase 24 amplía cobertura, no sustituye verificaciones anteriores.

## Procedimiento antes de cada fase

Leer `CURRENT_STATUS.md`, este roadmap y documentación pertinente; revisar `git status`, rama y últimos commits cuando exista repositorio. Si una decisión cambia la arquitectura, explicar la razón y actualizar el documento afectado. No iniciar la fase siguiente sin autorización.


