# API

[Índice de documentación](README.md) · [Instalación y pruebas](desarrollo.md).

API con Express, TypeScript y MySQL. Los endpoints de la aplicación cuelgan de `/api`; las imágenes subidas se sirven en `/uploads` y la comprobación de proceso está en `/health`.

## Organización

| Carpeta de `api/src/` | Responsabilidad |
| --- | --- |
| `routes/` | Registro de rutas, middleware de acceso y carga de imágenes. |
| `controllers/` | Lectura de parámetros y cuerpos, validación HTTP y respuestas. |
| `services/` | Coordinación de operaciones, validaciones y errores de recursos inexistentes. |
| `models/` | Consultas SQL y transacciones que afectan varias tablas. |
| `middleware/` | Sesión administrativa y recepción de archivos. |
| `utils/` | Parsers de productos, tokens y errores HTTP. |
| `config/` | Pool de MySQL y ubicación de archivos subidos. |
| `scripts/` | Migraciones incrementales y creación de usuarios. |

`app.ts` compone Express y maneja errores. `server.ts` inicia la escucha y el proceso de cierres mensuales. `BaseModel`, `BaseService` y los controladores/rutas CRUD reúnen operaciones comunes; checkout y editor de productos tienen operaciones específicas. Las operaciones de compras se desarrollan por separado y se describen al final como contrato previsto.

## Sesión administrativa

| Método y ruta | Comportamiento |
| --- | --- |
| `POST /api/auth/login` | Recibe `{ "user": "admin", "password": "CLAVE_LOCAL_PROPIA" }`, verifica el hash y crea la cookie. |
| `GET /api/auth/me` | Verifica la cookie y devuelve `{ "user": { "id": 1, "user": "admin" } }`. |
| `POST /api/auth/logout` | Elimina la cookie de sesión. |

La cookie se llama `auth_token`, tiene `HttpOnly`, ruta `/api` y duración de ocho horas. El token se firma con HMAC-SHA256 usando `JWT_SECRET`. En producción la cookie usa `Secure`; el atributo `SameSite` no se establece explícitamente en el código actual.

El cliente debe incluir cookies en las operaciones administrativas (`withCredentials: true` con Axios). `requireAuth` devuelve `401` cuando falta una sesión válida. Los usuarios se administran mediante el script `create-user`; actualmente no hay una ruta `/api/usuarios` registrada.

## Rutas públicas

| Método y ruta | Uso |
| --- | --- |
| `GET /health` | Devuelve `{ "status": "ok" }`; no prueba MySQL. |
| `GET /api/plantas` | Lista de plantas con la representación del modelo. |
| `GET /api/plantas/:id` | Detalle de planta con imágenes. |
| `GET /api/plantas/familia/:familia` | Resumen del catálogo; `AllPlants` obtiene todas las familias. |
| `GET /api/productos` | Alias de la lista de plantas. |
| `GET /api/productos/:id` | Alias del detalle de planta. |
| `GET /api/productos/familia/:familia` | Alias del listado por familia. |
| `GET /api/imagenes` y `GET /api/imagenes/:id` | Consulta de registros de imágenes. |
| `POST /api/ordenes/checkout` | Crea cliente, orden y detalles; descuenta stock. |
| `GET /api/ordenes/:id` | Consulta una orden con datos de cliente, entrega e ítems. |

La consulta pública de órdenes se identifica por su ID y actualmente no requiere token de seguimiento. Tenerlo presente al decidir qué información exponer antes de una publicación.

El resumen por familia usa nombres orientados al catálogo:

```json
{
  "id": 1,
  "name": "Deliciosa",
  "family": "Monstera",
  "price": 22500,
  "stock": 8,
  "habilitado": true,
  "image": "MonsteraDeliciosa",
  "discount": 10,
  "label": "nuevo",
  "labels": ["nuevo", "oferta"]
}
```

`discount` es el porcentaje almacenado en la planta. `image` corresponde a la primera imagen por ID y puede ser `null`. La lista general y el detalle usan nombres como `nombre`, `familia` y `precio`; no asumir que todas las respuestas tienen la forma del resumen.

## Rutas administrativas

Todas las siguientes requieren la cookie de sesión.

| Método y ruta | Uso |
| --- | --- |
| `GET /api/dashboard` | Indicadores, históricos y comparación de desempeño. |
| `GET /api/productos/inventario` | Inventario con stock, disponibilidad y ventas. |
| `POST /api/productos` | Alta de producto; admite JSON y el formulario multipart del panel. |
| `GET /api/productos/:id/edicion` | Datos del editor administrativo. |
| `PATCH /api/productos/:id/edicion` | Guarda el formulario de edición y sus imágenes. |
| `PATCH /api/productos/:id/stock` | Agrega unidades con `{ "cantidad": 3 }`; debe ser un entero positivo. |
| `PATCH /api/ordenes/:id/estado` | Cambia el estado con `{ "estado": "listo" }`. |

Además se registran rutas CRUD de clientes, plantas/productos, imágenes y órdenes: listado, alta, detalle, modificación y eliminación. Las lecturas públicas indicadas arriba se resuelven antes del middleware administrativo. Las rutas específicas deben permanecer antes de los routers CRUD para no interpretar `inventario` como un ID.

Los detalles de orden usan una clave compuesta: `GET/POST /api/orden-detalles` y `GET/PATCH/DELETE /api/orden-detalles/:ordenId/:plantaId`. Las rutas CRUD no sustituyen las operaciones transaccionales del checkout ni del editor.

## Checkout

Ejemplo de cuerpo; reemplazar `plantId` por un producto existente y habilitado:

```json
{
  "items": [{ "plantId": 1, "quantity": 2 }],
  "customer": {
    "nombre": "Cliente de ejemplo",
    "direccion": "Dirección de ejemplo, San Luis",
    "detalleUbicacion": "Datos ficticios",
    "latitude": -33.3,
    "longitude": -66.3
  },
  "paymentMethod": "transferencia"
}
```

`telefono` es opcional. Se aceptan `transferencia`, `mercado_pago` y `efectivo`. La respuesta de creación es `201` con `{ "orderId": 123 }`. El servidor consulta precios y descuentos; el cliente no envía el total. Las líneas de una misma planta se agrupan antes de comprobar existencias. Orden, cliente, detalles y descuento de inventario se guardan en una transacción.

## Productos e imágenes

El formulario administrativo envía `multipart/form-data`:

- `datos`: JSON con los campos del producto y `imagenesEliminadas`, una lista de IDs.
- `imagenes`: archivos nuevos opcionales, hasta diez por guardado.

Cada imagen debe ser JPG, PNG o WebP y pesar como máximo 5 MB. El servidor verifica el contenido del archivo, genera un nombre propio y lo guarda en `api/uploads/`. Las URLs nuevas tienen la forma `/uploads/<uuid>.<extensión>`.

El editor actual usa `tamano` como clave JSON. No enviar la clave antigua `tamaño`. Para reproducir el formulario, enviá sus campos completos: `nombre`, `familia`, `precio`, `discount`, `etiqueta`, `etiquetas`, `origen`, `tipo`, `iluminacion`, `resistencia`, `tamano`, `cuidado`, `descripcion`, `petFriendly`, `habilitado` e `imagenesEliminadas`. Los textos opcionales pueden ser `null`.

La creación multipart requiere además `stock`, entero entre `0` y `2147483647`, e `imagenesEliminadas: []`. La edición no acepta `stock` ni `ventas`. Las ventas se calculan a partir de las órdenes; las entradas manuales de inventario usan la ruta de stock.

Los cambios del producto y los registros de imágenes se guardan en una transacción. Si falla el guardado se limpian los archivos nuevos. Los archivos retirados se eliminan después de guardar los cambios. Las imágenes incluidas originalmente en el cliente siguen siendo compatibles.

Las opciones de tamaño, iluminación, resistencia, cuidado, etiquetas y aptitud para mascotas están descritas en [reglas de negocio](reglas-de-negocio.md#productos-y-disponibilidad).

## Compras

**Contrato previsto, en desarrollo en `fayan`.** Los siguientes endpoints, validaciones y movimientos de stock no están implementados en esta rama. Esta sección conserva la referencia documental para integrar ese trabajo por separado.

| Método y ruta previstos | Uso |
| --- | --- |
| `GET /api/compras` | Lista compras; acepta `desde` y `hasta` inclusivos en formato `AAAA-MM-DD`. |
| `POST /api/compras` | Registra una compra y aplica su stock. |
| `GET /api/compras/:id` | Detalle de compra. |
| `PATCH /api/compras/:id` | Reemplaza datos e ítems y aplica la diferencia de stock. |
| `POST /api/compras/:id/anular` | Anula conservando el detalle original. |

Ejemplo de alta:

```json
{
  "fecha": "2026-10-22",
  "proveedor": "Proveedor de ejemplo",
  "observaciones": "Reposición de plantas e insumos",
  "items": [
    { "descripcion": "Monstera", "tipo": "planta", "plantaId": 1, "cantidad": 3, "precioUnitario": 7000 },
    { "descripcion": "Sustrato", "tipo": "insumo", "plantaId": null, "cantidad": 2, "precioUnitario": 2500 }
  ]
}
```

Se aceptan de uno a cien ítems. `tipo` puede ser `planta`, `maceta`, `insumo`, `herramienta` u `otro`. Una planta exige `plantaId`; los demás tipos usan `null`. Las cantidades son enteros positivos y los precios admiten hasta dos decimales. El servidor calcula el total en centavos y rechaza totales superiores a `99.999.999,99`.

Para editar, enviar el cuerpo completo anterior más `version`, usando el valor recibido al consultar. Para anular, enviar `{ "version": 1 }` con la versión vigente. Una versión desactualizada devuelve `409`: recargar antes de volver a guardar. Las compras anuladas no se pueden editar ni anular otra vez. Ver [compatibilidad de compras e inventario](reglas-de-negocio.md#compras-e-inventario).

## Errores

Los errores controlados se devuelven como `{ "error": "Mensaje" }`.

| Estado | Casos habituales |
| --- | --- |
| `400` | Campos inválidos, formato de fecha, estado o archivo no admitido. |
| `401` | Falta sesión, sesión expirada o credenciales inválidas. |
| `404` | Planta, compra u orden inexistente. |
| `409` | Stock insuficiente o producto deshabilitado; el contrato previsto de compras agrega conflictos por anulación y versión antigua. |
| `500` | Error no controlado; revisar la salida de la API. |
