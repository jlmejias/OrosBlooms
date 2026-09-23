# Modelo de datos inicial — OrosBlooms

Estado: esquema de negocio y seed de desarrollo implementados en Fase 4. La Fase 0 conectó PostgreSQL en Docker y aplicó la migración de `foundation_checks`.

## Convenciones

- IDs UUID, claves foráneas explícitas, `created_at` y `updated_at` en entidades editables. Tiempos en UTC; fechas de evento con zona horaria de negocio definida.
- Precios y montos en enteros de unidad monetaria mínima. CRC se muestra en colones; no usar `float`.
- Slugs únicos donde hay URL pública. Estados restringidos mediante enum o `CHECK`, más validación Zod.
- Índices según consultas reales: slug, estado y fecha, claves foráneas y orden editorial. No almacenar imágenes binarias en PostgreSQL.
- Borrado lógico en contenido con historial comercial cuando corresponda. Pedidos conservan instantáneas de nombre y precio de ítems para que cambios al catálogo no alteren compras pasadas.

## Entidades y relaciones

| Entidad | Campos principales | Relaciones y propósito |
| --- | --- | --- |
| `users` | email único, hash/identidad externa, activo, marcas de tiempo | Acceso administrativo; sin registro público. |
| `roles` | código único (`admin`, `editor`) | Catálogo de permisos. |
| `user_roles` | user_id, role_id | PK compuesta; permite roles futuros. |
| `customers` | nombre, email, teléfono, preferencias de contacto | 1:N solicitudes y pedidos; deduplicación prudente por contacto. |
| `categories` | nombre, slug, descripción, orden, visible | 1:N productos; clasificación de navegación, independiente del tipo. |
| `products` | nombre, slug, tipo (`floral`, `complement`, `personalized`), descripción breve/larga, precio base, etiqueta de precio, estado, destacado, personalizable, categoría | 1:N imágenes y variantes. Un solo modelo y administración reutilizable. |
| `product_images` | product_id, media_asset_id, orden, principal | Relación entre catálogo y media. |
| `product_variants` | product_id, nombre, atributos, precio, disponible, orden | Tamaño/color y precio concretos. |
| `product_complement_recommendations` (Fase futura) | floral_product_id, complement_product_id, orden, activo | N:M explícita para sugerir complementos compatibles con cada arreglo. |
| `combos` (Fase futura) | nombre, slug, descripción, imagen, precio, precio promocional, inicio, fin, destacado, activo | Regalos compuestos y campañas con vigencia. |
| `combo_items` (Fase futura) | combo_id, product_id, variant_id opcional, cantidad | Composición de cada combo. |
| `services` | nombre, slug, tipo, descripción, imagen, visible | Bodas, eventos y diseños cotizados. |
| `gallery_items` | título, slug, categoría, fecha, descripción, destacado, orden | Trabajo publicado. |
| `gallery_images` | gallery_item_id, media_asset_id, orden | Galería ordenada. |
| `inquiries` | referencia única, customer_id, tipo, ocasión, estilo, colores, presupuesto, fecha requerida, entrega/retiro, notas, estado, notas internas | Solicitudes personalizadas. |
| `inquiry_images` | inquiry_id, media_asset_id, orden | Referencias privadas aportadas por cliente. |
| `orders` | referencia única, customer_id, inquiry_id opcional, fecha requerida, modo entrega, dirección, subtotal, entrega, total, adelanto, saldo, estado | Pedido y origen de cotización. |
| `order_items` | order_id, product_id opcional, variant_id opcional, nombre/precio unitario snapshot, cantidad, personalización, total | Preserva detalle histórico. |
| `events` | título, tipo, cliente_id opcional, fecha, lugar, estado, notas | Agenda del negocio; vínculo opcional a pedido/solicitud se define en su fase. |
| `testimonials` | nombre visible, texto, imagen opcional, aprobación, orden | Publicación controlada. |
| `homepage_sections` | clave, visible, orden, contenido JSON validado, inicio/fin | CMS de portada; JSON por tipo de sección, no datos de catálogo. |
| `site_settings` | clave única, valor JSON validado, actualizado | Configuración de contacto, redes, entrega y textos. |
| `media_assets` | provider, provider_id, URL/ruta, ancho, alto, bytes, formato, alt, visibilidad | Recurso reutilizable; privado para inspiración de clientes. |

## Estados

- Producto: `draft`, `active`, `archived`.
- Solicitud: `new`, `reviewing`, `quoting`, `quoted`, `approved`, `rejected`, `completed`. La UI traduce estos valores a español. El brief menciona `quoted` y además distingue “Cotizando” de “Cotización enviada”; por ello se proponen ambos `quoting` y `quoted`.
- Pedido: `draft`, `pending`, `confirmed`, `preparing`, `ready`, `delivered`, `cancelled`.

Las transiciones permitidas y permisos se formalizarán al implementar cada flujo. `inquiries` y `orders` no deben compartir estado por conveniencia.

## Flores, complementos y regalos futuros

`floral` es el producto principal. `complement` incluye osos y peluches, chocolates y cajas de chocolates, globos y tarjetas. `personalized` incluye termos, vasos, artículos Cricut y otros regalos personalizados. Estas clases comparten `products`, imágenes, precio y estado. Las variantes resuelven tamaños y colores del arreglo; dedicatorias y demás elecciones pertenecen a la configuración de compra, no al producto global.

Un arreglo recomienda complementos mediante la asociación explícita propuesta arriba. El cliente podrá seleccionar varios. La suma conceptual usa precio de la variante floral más cada complemento, cantidad y cualquier ajuste validado. El pedido conservará una línea por elemento con precio y nombre al momento de confirmar. Los combos se modelarán como composición separada para no alterar los precios individuales. Ninguna de estas tablas futuras se crea en Fase 0.

## Migraciones y seed

Migraciones versionadas con Drizzle; aplicación explícita en desarrollo y despliegue, nunca `push` contra producción. `npm run db:seed` carga categorías, seis productos de muestra (cuatro florales activos y dos borradores), servicios, galería y un testimonio ficticio **sin aprobar**. Puede ejecutarse varias veces sin duplicar esos registros. `npm run db:check-business` verifica conteos, referencias básicas y que el testimonio ficticio no sea público. El seed es solo para desarrollo y no debe ejecutarse en producción. Bases de desarrollo, pruebas y E2E separadas por URL y credenciales. Los uploads privados no entran en el seed público.

Los importes se guardan como enteros de colones costarricenses. El esquema comprueba importes no negativos, consistencia de totales de pedidos, rangos de presupuesto y unicidad de la imagen principal por producto. La aplicación deberá validar nuevamente entradas y transiciones de estado en sus fases respectivas. `updated_at` se actualiza explícitamente al editar; no existe trigger global. Las fechas se guardan con zona horaria y se mostrarán según la zona del negocio en la UI.
