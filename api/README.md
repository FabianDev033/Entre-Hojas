# Entre Hojas API

## Disponibilidad de productos

Antes de iniciar esta versión, ejecutá `pnpm migrate:product-availability` desde `api/`.
La migración agrega `plantas.habilitado` sin modificar el stock y conserva los estados al volver a ejecutarla.
Los productos existentes quedan habilitados. El formulario guarda el interruptor con los demás cambios;
el catálogo mantiene visibles los productos deshabilitados o con stock cero y el checkout impide comprarlos.

Express + TypeScript API using an MVC-style structure:

- `models/`: database queries and SQL only.
- `services/`: resource rules and not-found handling.
- `controllers/`: HTTP request/response handling.
- `routes/`: URL-to-controller mapping.

## Setup

1. Import `entreHojas.sql` into MySQL (it creates the `mydb` database).
2. Copy `.env.example` to `.env` and set the MySQL credentials.
3. Run `pnpm migrate:product-labels` to enable multiple labels (safe to run again).
4. Run `pnpm migrate:pet-friendly` to add the optional pet suitability field (safe to run again).
5. Run `pnpm dev` from this directory.

The health check is `GET /health`. All application endpoints are under `/api`.

## Product editor

The administrative editor uses `GET /api/productos/:id/edicion` and
`PATCH /api/productos/:id/edicion`, both requiring an administrator session.
Stock and sales are read-only in this editor; stock additions keep using their existing endpoint.
The add-product page reuses this form with empty fields, discount and initial stock
set to zero. Initial stock is editable only during creation; sales start at zero
and continue to be calculated from confirmed or delivered orders.
Creation uses authenticated `POST /api/productos` with multipart data in the same
format as editing, adding a required integer `stock` between 0 and 2147483647.
`imagenesEliminadas` must be empty. Product data, labels and image records are
created in one transaction, and failed saves remove newly uploaded files.
The existing JSON creation endpoint remains supported.
The editor uses fixed choices for size (`Pequeño`, `Mediano`, `Grande`), light and
resistance (`Poca`, `Media`, `Mucha`), and care (`Fácil`, `Medio`, `Difícil`).
These fields can also be left unspecified. Previous descriptions outside these
choices remain visible until an administrator selects a valid replacement.

Pet suitability uses `petFriendly`: `true` (Sí), `false` (No), or `null`
(Sin especificar). The migration adds a nullable BOOLEAN column without assigning
suitability to existing plants. Run it before deploying the updated API and client.
The editor and the plant creation/update endpoints accept only JSON booleans or
null; strings such as `"Sí"` or `"false"` are rejected. Omitting the field when
updating preserves its current value. Plant list, detail and editor responses
return booleans or null, converting MySQL's 0/1 values. The storefront displays
the value in the product details.

The update accepts multipart form data: `datos` contains the editable plant fields
as JSON plus `imagenesEliminadas` (image IDs), and `imagenes` contains optional files.
Images must be JPG, PNG or WebP, up to 5 MB each and 10 new images per save.
Plant changes and image records are saved in one database transaction.

Uploaded files are stored in `api/uploads/` and served at `/uploads/`.
Keep this folder on persistent storage when deploying, and include it in backups.
Existing bundled images remain supported.

Labels are selected manually: `promo`, `oferta`, `ultimo`, `top`, `nuevo`, `volvio`,
`elegido`, `limitada`, `regalo`, or no label. Assign any combination in `etiquetas`;
`etiqueta` selects the one shown on the storefront card and must belong to that list.
If no labels are assigned, `etiqueta` must be empty or null. `oferta` requires a discount
greater than zero even when another label is selected for display.
Existing plants retain their current label until edited. The catalog returns both
`labels` (all assigned labels) and `label` (the visible one), so offer filtering is
independent of the displayed badge.

## CRUD endpoints

| Resource | Base path |
| --- | --- |
| Clientes | `/api/clientes` |
| Plantas | `/api/plantas` |
| Imágenes | `/api/imagenes` |
| Órdenes | `/api/ordenes` |
| Usuarios | `/api/usuarios` |
| Detalles de orden | `/api/orden-detalles` |

The first five use the usual CRUD routes: `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, and `DELETE /:id`.

Plant searches:

- `GET /api/plantas/:id` returns every plant field plus its `imagenes` array.
- `GET /api/plantas/familia/:familia` returns `{ id, name, price, image, discount, label }` for each matching plant. `image` is the first image registered for that plant and `discount` is currently `0`, because the database has no discount field.
- `/api/productos` is an alias for `/api/plantas`, including both searches.

`orden_detalle` has a composite key in the schema, so a single detail is addressed as:

`/api/orden-detalles/:ordenId/:plantaId`

`POST /api/plantas` example:

```json
{
  "nombre": "Monstera deliciosa",
  "precio": 22500,
  "stock": 8,
  "familia": "Araceae"
}
```

The `plantas` API preserves the database field name `tamaño`; send that exact JSON key when using it.
