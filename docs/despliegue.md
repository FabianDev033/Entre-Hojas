# Despliegue y operación

[Índice de documentación](README.md).

Esta guía reúne los requisitos del código actual. Todavía no hay una receta ligada a un proveedor, un contenedor ni una configuración de integración continua incluidos en el repositorio.

## Preparar la versión

1. Disponer de una base MySQL con el esquema del proyecto. El SQL de creación inicial sigue pendiente de incorporarse al repositorio.
2. Instalar dependencias de raíz, API y cliente según [desarrollo local](desarrollo.md).
3. Configurar las variables de la API en el entorno de ejecución y las del cliente antes de compilar.
4. Respaldar base e imágenes antes de aplicar migraciones sobre una instalación existente.
5. Ejecutar las tres migraciones documentadas y verificar que terminaron correctamente. La migración del módulo de compras pertenece a su implementación separada y no está incluida en esta rama.
6. Compilar desde la raíz:

```sh
pnpm --dir api build
pnpm --dir client build
```

Los resultados quedan en `api/dist/` y `client/dist/`.

## Servir la aplicación

Iniciá el proceso de API desde su carpeta para que encuentre el archivo `.env` si lo usás:

```sh
pnpm --dir api start
```

También se pueden inyectar variables desde el administrador de procesos del hosting. Configurá un `PORT` explícito y `NODE_ENV=production`, además de MySQL, `JWT_SECRET` y `CLIENT_ORIGIN`.

Serví `client/dist/` con un servidor de archivos estáticos. Las rutas de React Router necesitan devolver `index.html` al entrar directamente a una pantalla como `/admin/ordenes`; no aplicar ese fallback a `/api` ni `/uploads`.

Una configuración bajo un mismo origen simplifica las solicitudes y las cookies:

| Solicitud pública | Destino |
| --- | --- |
| `/api/...` | API Express, conservando el prefijo `/api`. |
| `/uploads/...` | API Express, conservando el prefijo `/uploads`. |
| `/health` | API Express, si se expone para monitoreo. |
| Resto | Archivos estáticos del cliente y fallback de la SPA. |

Para ese caso compilá con `VITE_API_URL=` vacío. Usá HTTPS: en producción la cookie de sesión tiene `Secure`. `CLIENT_ORIGIN` debe coincidir con el origen público del sitio.

Si el cliente y la API viven en orígenes distintos, compilá con el origen completo en `VITE_API_URL` y verificá CORS y el envío de cookies. El código actual no establece `SameSite` explícitamente; no asumir que una sesión entre sitios distintos funcionará sin ajustar y validar su configuración.

`pnpm --dir client preview` sirve para inspeccionar la compilación localmente. El proxy está definido para desarrollo; no usar `preview` como configuración de producción ni asumir que conecta por sí solo la API.

## Datos que deben persistir

- **MySQL:** productos, imágenes registradas, usuarios, clientes, órdenes, compras y cierres mensuales.
- **`api/uploads/`:** archivos cargados desde el panel. El código compilado también resuelve esta carpeta fuera de `dist/`.

No guardar uploads únicamente en el filesystem temporal de una instancia. Respaldar los archivos junto con su base y probar una restauración: tener registros de imágenes sin los archivos deja URLs rotas. Las imágenes originales del catálogo se incluyen al compilar el cliente.

Para volver a una versión anterior, considerar también la compatibilidad del esquema. Las migraciones incluidas no tienen una reversión automática y una versión anterior podría no entender compras o campos nuevos.

## Comprobar la instalación

- `/health` responde; comprobar además una consulta que use MySQL, ya que ese endpoint solo prueba el proceso.
- El catálogo, el detalle y las imágenes cargan desde la URL pública.
- El administrador puede iniciar sesión y recargar una ruta interna sin perder el acceso por una configuración de proxy incorrecta.
- Los formularios y cambios de estado se prueban con datos de prueba antes de habilitar la operación real.
- Node.js y MySQL usan una zona horaria coherente para fechas y cierres mensuales.

Revisar antes de publicar las decisiones todavía abiertas: [cancelación y stock](reglas-de-negocio.md#órdenes-y-stock) y [consulta pública de órdenes por ID](api.md#rutas-públicas). `docs/preview.mjs` es una herramienta local con sesión y datos ficticios; no debe desplegarse como backend.
