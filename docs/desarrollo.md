# Desarrollo local

[Índice de documentación](README.md).

## Requisitos

- Node.js. Los comandos de esta documentación se verificaron con Node.js 24.
- pnpm. `api/package.json` declara pnpm `11.11.0`.
- MySQL y una base con el esquema existente de Entre Hojas.
- Una clave de Google Maps si vas a usar la búsqueda y el autocompletado de direcciones.

El repositorio todavía no contiene un SQL completo para crear la base desde cero. No alcanza con crear una base vacía: las migraciones incluidas esperan tablas existentes, como `plantas` y `compras`. Solicitá al equipo una exportación del esquema sin información de clientes. Usá ese nombre de base en `DB_NAME`; `entre_hojas` en la plantilla es solo un ejemplo.

Para explorar la interfaz sin MySQL, usá la [vista de documentación](capturas.md).

## 1. Instalar dependencias

Desde la raíz:

```sh
pnpm install
pnpm --dir api install
pnpm --dir client install
```

Hay manifiestos y archivos de bloqueo en la raíz, en `api/` y en `client/`. Instalá las tres carpetas; no asumas que instalar solo la raíz prepara todo.

## 2. Configurar el entorno

Copiá `api/.env.example` a `api/.env` y `client/.env.example` a `client/.env`. En PowerShell, si todavía no existen los archivos de destino:

```powershell
Copy-Item api/.env.example api/.env
Copy-Item client/.env.example client/.env
```

Si ya tenés archivos `.env`, compará sus claves con las plantillas en lugar de sobrescribirlos. Los archivos reales están excluidos de Git.

### API: `api/.env`

| Variable | Uso |
| --- | --- |
| `PORT` | Configurar `3000` para coincidir con el proxy del cliente. El fallback actual del servidor es la cadena `0.0.0.0`; no usarlo como un puerto predeterminado. |
| `DB_HOST` | Host de MySQL. Obligatoria. |
| `DB_PORT` | Puerto de MySQL. Por defecto `3306`. |
| `DB_NAME` | Nombre de la base restaurada. Obligatoria. |
| `DB_USER` | Usuario de MySQL. Obligatoria. |
| `DB_PASSWORD` | Contraseña de ese usuario. |
| `JWT_SECRET` | Secreto para firmar y verificar las sesiones administrativas. Obligatorio para autenticarse. |
| `CLIENT_ORIGIN` | Origen permitido por CORS. Por defecto `http://localhost:5173`. |
| `NODE_ENV` | Usar `development` localmente. En producción activa el atributo `Secure` de la cookie. |

Podés generar un secreto propio con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` y copiar el resultado a `JWT_SECRET`.

### Cliente: `client/.env`

| Variable | Uso |
| --- | --- |
| `VITE_API_URL` | Vacía usa rutas del mismo origen (`/api` y `/uploads`). Si se omite, varios módulos usan `http://localhost:3000`. Para usar otra API, indicar su origen sin `/api` al final. |
| `VITE_GOOGLE_MAPS_API_KEY` | Clave usada por la búsqueda y el autocompletado de direcciones. Sin ella, esa búsqueda no está disponible. |

Las variables `VITE_*` son visibles en el navegador. No poner contraseñas de MySQL ni `JWT_SECRET` en el cliente. Reiniciá Vite cuando cambien las variables; en producción requieren volver a compilar.

## 3. Aplicar migraciones

Después de restaurar el esquema y configurar MySQL, ejecutá desde la raíz:

```sh
pnpm --dir api migrate:product-labels
pnpm --dir api migrate:pet-friendly
pnpm --dir api migrate:product-availability
```

| Migración | Cambio |
| --- | --- |
| `product-labels` | Agrega `plantas.etiquetas` para múltiples etiquetas. |
| `pet-friendly` | Agrega `plantas.petFriendly`, inicialmente sin especificar. |
| `product-availability` | Agrega `plantas.habilitado`, inicialmente verdadero. |

Comprueban si existen las columnas antes de agregarlas y se pueden volver a ejecutar. No son un sistema de creación inicial de tablas ni incluyen comandos de reversión.

La migración `migrate:purchases` pertenece al trabajo de compras que se desarrolla por separado en `fayan`; no está incluida en esta rama ni debe ejecutarse como parte de esta instalación. Su diseño está descrito en [reglas de negocio](reglas-de-negocio.md#compras-e-inventario).

## 4. Crear el administrador

Desde la raíz, reemplazando los valores de ejemplo:

```sh
pnpm --dir api create-user -- --user admin --password "CLAVE_LOCAL_PROPIA"
```

El script guarda un hash con `scrypt`. Si el usuario ya existe, actualiza su contraseña. No hay un administrador ni una contraseña universal incluidos en el repositorio.

## 5. Iniciar la aplicación

Desde la raíz:

```sh
pnpm dev
```

También podés usar dos terminales, una para `pnpm --dir api dev` y otra para `pnpm --dir client dev`.

- Sitio: [http://localhost:5173](http://localhost:5173).
- Acceso administrativo: [http://localhost:5173/admin/login](http://localhost:5173/admin/login).
- Salud del proceso API: [http://localhost:3000/health](http://localhost:3000/health).

Vite usa el puerto `5173` con `strictPort` y reenvía `/api` y `/uploads` a `127.0.0.1:3000`. `/health` responde `{ "status": "ok" }`, pero no comprueba la conexión a MySQL.

## Probar desde el celular

1. Conectá la PC y el celular a la misma red.
2. Dejá `VITE_API_URL=` vacío en `client/.env`.
3. Iniciá la API con `PORT=3000` y ejecutá `pnpm dev` desde la raíz.
4. Abrí `http://<IP-local-de-la-PC>:5173` desde el celular. Vite muestra la dirección como **Network**; en Windows también podés consultar la IP con `ipconfig`.

Vite escucha en la red local. Si no abre, revisá el permiso de Node.js en el Firewall de Windows para la red privada y que el Wi-Fi no aísle los dispositivos. No hace falta configurar el router para exponer puertos a Internet.

El proxy mantiene API e imágenes bajo el mismo origen que la página y evita que el celular intente conectarse a su propio `localhost`. La geolocalización del navegador puede requerir HTTPS; no des por hecho que funcionará en una dirección HTTP de la red local.

## Comandos de verificación

Desde la raíz:

```sh
pnpm --dir api build
pnpm --dir client build
pnpm --dir client lint
```

Al preparar esta documentación, la compilación del cliente reportó `TS6133` en `src/Components/checkout/LocationModal.tsx`: `isLocating` y `useCurrentLocation` están declarados pero no se usan. El lint también reportó nueve errores existentes en componentes y contextos. Son pendientes del código actual; la vista de demostración de Vite no ejecuta esas comprobaciones.

### Pruebas sin MySQL

```sh
pnpm --dir api exec tsx --test tests/product-edit.test.ts tests/admin-access.test.ts
pnpm --dir api exec tsx --test ../client/tests/orderBoard.test.ts
```

Cubren validaciones de productos, acceso administrativo y movimientos del tablero. El segundo comando usa el ejecutor `tsx` instalado en la API para las pruebas del cliente. Las pruebas de compras corresponden a su implementación separada. El script `test` de la raíz sigue siendo un marcador y no ejecuta estas pruebas.

### Pruebas de integración con MySQL

Usá una base de pruebas con el esquema y las migraciones preparados. En PowerShell, desde la raíz:

```powershell
$env:RUN_DB_TESTS = "1"
try {
    pnpm --dir api exec tsx --test tests/product-edit.integration.test.ts tests/product-availability.integration.test.ts
} finally {
    Remove-Item Env:RUN_DB_TESTS
}
```

En una shell compatible con POSIX:

```sh
RUN_DB_TESTS=1 pnpm --dir api exec tsx --test tests/product-edit.integration.test.ts tests/product-availability.integration.test.ts
```

Sin `RUN_DB_TESTS=1` se omiten. Estas pruebas escriben registros y, según el caso, imágenes temporales; limpian sus propios recursos. Cargan las credenciales de `api/.env`, por lo que la base de pruebas debe estar seleccionada allí antes de ejecutarlas.

## Problemas frecuentes

| Síntoma | Revisar |
| --- | --- |
| Error de variable `DB_*` faltante | `api/.env`, nombres de claves y directorio de ejecución de la API. |
| Tabla o columna inexistente | Esquema inicial restaurado y las tres migraciones aplicadas. |
| El catálogo no carga | API en `3000`, `VITE_API_URL` y proxy de Vite. |
| El login falla | Usuario creado con el script y `JWT_SECRET` configurado. |
| El panel vuelve al login | Cookie de sesión, expiración de ocho horas y uso consistente de `localhost` o de la IP. |
| No aparecen imágenes subidas | Archivos en `api/uploads/` y ruta `/uploads` accesible. |
| No se pueden buscar direcciones | `VITE_GOOGLE_MAPS_API_KEY` y configuración de esa clave para el origen usado. |
| Vite no inicia en `5173` | Otro proceso ocupa ese puerto; la configuración no elige otro automáticamente. |
