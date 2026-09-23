# Despliegue de OrosBlooms

## Requisitos

- Node.js 22 y PostgreSQL con copias de seguridad administradas.
- Sistema de archivos persistente o proveedor de objetos para `public/uploads` y `storage/inquiries`.
- HTTPS obligatorio y dominio definitivo configurado en `NEXT_PUBLIC_SITE_URL`.

## Variables obligatorias

Configurar `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET`. El secreto de sesión debe ser largo, aleatorio y distinto por ambiente. Completar también las variables `BUSINESS_*` descritas en `.env.example`; nunca publicar con los textos “pendiente de configuración”.

## Proceso de publicación

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run db:migrate
npm run build
npm start
```

Las migraciones deben ejecutarse una sola vez por despliegue antes de enviar tráfico a la nueva versión. No ejecutar `db:seed` en producción.

## Copias de seguridad y restauración

1. Programar una copia diaria de PostgreSQL y conservar varias generaciones fuera del servidor principal.
2. Respaldar en el mismo ciclo los uploads públicos y las referencias privadas.
3. Probar periódicamente la restauración en un ambiente aislado; una copia no verificada no se considera recuperable.
4. Antes de una migración destructiva, crear una copia manual y registrar el punto de restauración.

## Seguridad y operación

- Restringir la base de datos a la red de la aplicación y rotar credenciales ante cualquier exposición.
- Mantener `/admin`, `/acceso-admin` y `/api` fuera de índices; las acciones administrativas validan sesión nuevamente.
- Servir referencias privadas únicamente a través del endpoint autenticado.
- Configurar límites de tamaño y retención en el proveedor de archivos.
- Supervisar errores 5xx, latencia, espacio de almacenamiento y fallos de copias de seguridad.

## Verificación posterior

Confirmar Home, catálogo, detalle, solicitud, acceso administrativo, `robots.txt`, `sitemap.xml`, cabeceras de seguridad y acceso a archivos públicos/privados. Verificar el dominio canónico y una restauración de prueba antes de considerar el ambiente listo.
