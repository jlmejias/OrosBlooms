# OrosBlooms

Aplicación floral bilingüe con catálogo, carrito, checkout SINPE, solicitudes personalizadas y panel administrativo.

## Desarrollo local

Requisitos: Node.js 22, npm y Docker Desktop.

```powershell
docker compose up -d --wait
Copy-Item .env.example .env.local
npm ci
npm run db:migrate
npm run db:seed
npm run db:check-business
npm run db:check
npm run dev
```

Abre `http://localhost:3000`. PostgreSQL se publica solamente en `127.0.0.1:54329`; `docker compose down` detiene el servicio sin borrar su volumen.

## Administración segura

Genera el hash de la contraseña con `npm run admin:hash-password -- "una contraseña de al menos 8 caracteres"` y configura `ADMIN_PASSWORD_HASH` y un `ADMIN_SESSION_SECRET` de al menos 32 caracteres. El acceso local inseguro solo se habilita explícitamente con `ALLOW_INSECURE_LOCAL_ADMIN=true` y nunca funciona en producción.

Los archivos públicos y privados usan Neon Object Storage en producción. El fallback local está limitado a desarrollo o a QA explícito.

## QA aislado

Configura `QA_DATABASE_URL` con una base PostgreSQL local cuyo nombre termine en `_qa` o `_test`. Si se omite, el script deriva una base `_qa` de la `DATABASE_URL` local.

```powershell
npm run qa:setup
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

`qa:setup` se niega a operar contra hosts remotos, limpia únicamente la base QA, aplica migraciones y carga datos ficticios. El transporte de correo de las pruebas es mock.

## Operación y almacenamiento

- `npm run storage:report` genera un inventario de archivos usados, huérfanos y duplicados sin borrar nada.
- `npm run db:clear -- --confirm` vacía una base local conservando las migraciones.
- `http://localhost:3000/design-system` muestra la guía visual solo en desarrollo.

Consulta [docs/AUDIT_REMEDIATION_2026-09-24.md](docs/AUDIT_REMEDIATION_2026-09-24.md) para el cierre de la auditoría y las comprobaciones ejecutadas.
