# Cierre de auditoría de OrosBlooms

Fecha de cierre técnico: 24 de septiembre de 2026.

## Resultado

Los 25 hallazgos funcionales, técnicos y de seguridad de la auditoría quedaron corregidos en el código. La validación se hizo sobre una base PostgreSQL QA local aislada; no se modificó ni limpió una base remota o de producción.

| Hallazgo | Estado | Corrección principal |
| --- | --- | --- |
| SEC-01 | Cerrado | Autorización del servidor antes de leer datos o renderizar cualquier ruta administrativa. |
| PAY-01 | Cerrado | Revisión de pagos con bloqueo de fila, actualización condicional de stock y transacción atómica. |
| BUY-01 | Cerrado | Contrato discriminado para productos y combos; complementos, repetidos e inventario consolidado. |
| PAY-02 | Cerrado | Una sola función de precios calcula subtotal, entrega, adelanto configurable y saldo. |
| PAY-03 | Cerrado | Stripe se retiró hasta contar con una integración real; el checkout ofrece únicamente SINPE. |
| DATA-01 | Cerrado | Checkout y solicitudes realizan sus escrituras relacionadas dentro de transacciones. |
| SEC-02 | Cerrado | Rate limiting persistente e idempotencia en login, checkout, cotización, solicitudes y comprobantes. |
| PAY-04 | Cerrado | Estados permitidos, reemplazo controlado de comprobante, compensación de uploads e idempotencia. |
| OPS-01 | Cerrado | Migraciones, seed repetible, verificación de negocio y entorno QA seguro. |
| MAIL-01 | Cerrado | Envío posterior al commit con estado, error e intentos persistidos; transporte mock para QA. |
| RWD-01 | Cerrado | Navegación administrativa móvil mediante drawer y correcciones de overflow. |
| I18N-01 | Cerrado | Búsqueda, detalle, checkout, gracias y privacidad completados en español e inglés. |
| ADM-01 | Cerrado | CRUD administrativo de categorías y navegación correspondiente. |
| DATA-02 | Cerrado | Identidad normalizada por la combinación exacta de correo y teléfono, con restricción única. |
| DATA-03 | Cerrado | Referencias de pedido aleatorias robustas y restricción única en base de datos. |
| SEC-03 | Cerrado | Límites reducidos y validación de firma binaria para uploads sensibles. |
| ERR-01 | Cerrado | JSON malformado y payloads inválidos responden 400 en lugar de 500. |
| STORE-01 | Cerrado | Compensación de fallos, limpieza al reemplazar/eliminar y reporte no destructivo de huérfanos/duplicados. |
| TECH-01 | Cerrado | Lint, tipos, build y verificación de seed actualizados y reproducibles. |
| UX-01 | Cerrado | La portada usa productos activos y destacados reales del catálogo. |
| SEC-04 | Cerrado | Contraseña scrypt, cookie firmada, rotación/expiración, secreto mínimo y headers CSP. |
| A11Y-01 | Cerrado | Nombres accesibles, controles administrativos identificables y targets táctiles corregidos. |
| I18N-02 | Cerrado | La página de gracias exige una referencia válida y redirige el acceso directo. |
| SEO-01 | Cerrado | `/admin` y el login usan `noindex`; robots excluye correctamente el panel. |
| TEST-01 | Cerrado | 15 pruebas unitarias y 12 escenarios E2E con Chromium y PostgreSQL real de QA. |

## Evidencia automatizada

- `npm test`: 15/15 pruebas unitarias.
- `npm run typecheck`: sin errores.
- `npm run lint`: sin errores ni warnings.
- `npm run build`: compilación de producción correcta con Next.js 16.3.5.
- `npx playwright test`: 12/12 escenarios E2E.
- `npm run qa:setup`: migraciones, limpieza segura, seed e integridad confirmados (12 productos y 6 categorías).

La suite E2E cubre autenticación y revocación de sesión, ausencia de filtración admin, CRUD de categoría/producto, checkout simple, costo de entrega y adelanto, combos, idempotencia, líneas repetidas, complementos, concurrencia de stock, solicitud con correo mock, comprobante privado, i18n y viewports de 375/390 px.

## Dependencias

`npm audit` no reporta vulnerabilidades críticas ni altas. Reporta cuatro entradas moderadas del mismo árbol transitivo de desarrollo (`drizzle-kit` → `@esbuild-kit` → `esbuild@0.18.20`, GHSA-67mh-4wv8-2f99). La recomendación automática exige bajar `drizzle-kit` de 0.31.11 a 0.18.1, una regresión incompatible, por lo que no se aplicó `--force`. Ese binario no forma parte del runtime de producción ni expone un servidor de esbuild en la aplicación.

## Operación previa al despliegue

1. Configurar secretos y Object Storage reales; no habilitar `ALLOW_INSECURE_LOCAL_ADMIN` ni `LOCAL_STORAGE_FOR_QA`.
2. Aplicar `db:migrate` sobre la base del entorno y ejecutar `db:check`.
3. Revisar el resultado de `storage:report` antes de borrar manualmente archivos heredados. El reporte no elimina archivos por diseño.
4. Ejecutar `npm run test:e2e` contra la base QA local, nunca contra producción.
