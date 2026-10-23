# Frontend

[Índice de documentación](README.md) · [Desarrollo local](desarrollo.md).

El cliente reúne el sitio público y el panel administrativo. Usa React, TypeScript, Vite, Tailwind CSS y React Router. Las solicitudes HTTP se realizan con Axios, los gráficos con Recharts y el tablero con dnd-kit.

## Organización

| Carpeta | Responsabilidad |
| --- | --- |
| `src/router/` | Rutas y composición de layouts. |
| `src/layouts/` | Estructura pública y administrativa. |
| `src/pages/main/` | Inicio, categorías, carrito, checkout y consulta de pedido. |
| `src/pages/admin/` | Acceso, dashboard, órdenes, productos y compras. |
| `src/Components/` | Componentes compartidos y formularios. Conservar la mayúscula al importar. |
| `src/contexts/` | Sesión, carrito, órdenes, productos y estadísticas. |
| `src/utils/` | Búsqueda, imágenes, disponibilidad y ubicación. |
| `src/assets/` | Iconos e imágenes incluidos en la compilación. |

Los colores y las familias tipográficas están definidos en `src/index.css`. Los formularios de creación y edición de productos reutilizan `ProductForm`. `PurchaseForm` pertenece al módulo de compras en desarrollo y no se incluye en esta rama.

## Pantallas

| Ruta | Pantalla |
| --- | --- |
| `/` | Inicio, categorías destacadas y catálogo. |
| `/categories` | Categorías. |
| `/categories/:family` | Listado de una familia; `Todo` muestra todas y `Ofertas` filtra etiquetas. |
| `/detalle/:id` | Detalle de planta. |
| `/cart` | Carrito. |
| `/checkout` | Datos de contacto, entrega y medio de pago. |
| `/orden/:orderId` | Consulta de la orden generada. |
| `/about` | Información del vivero. |
| `/admin/login` | Inicio de sesión. |
| `/admin` | Dashboard. |
| `/admin/ordenes` | Tablero de órdenes. |
| `/admin/productos` | Inventario. |
| `/admin/agregarProducto` | Alta de producto. |
| `/admin/productos/:id/editar` | Edición de producto. |
| `/admin/Compras` | Pantalla reservada para compras; actualmente muestra un placeholder. |

Se conserva la escritura de las rutas del router actual, incluidas `Compras` y `agregarProducto`.

El trabajo separado de compras prevé `/admin/Compras/nueva` y `/admin/Compras/:id/editar`, además del listado. Estas pantallas todavía no forman parte del código de esta rama.

## Estado y persistencia

- `AuthContext` consulta `/api/auth/me`, inicia y cierra sesión. Envía cookies con `withCredentials: true`.
- `AdminLayout` espera la verificación de sesión y redirige al login si no existe usuario. La autorización de los endpoints también se comprueba en el backend.
- `CartContext` guarda identificadores y cantidades en `localStorage`. No es una reserva de inventario; la API vuelve a calcular precios y comprobar stock al crear la orden.
- La ubicación de entrega se guarda en `localStorage` mediante `utils/location.ts`.
- `OrdersContext` carga las órdenes, traduce sus estados y persiste cambios de estado. `Components/orders/orderBoard.ts` mantiene la organización visual durante movimientos y sincronización.
- `ProductsContext` carga el inventario y agrega stock. Se monta en la pantalla de productos.
- `DashboardStatsContext` carga estadísticas y las distribuye entre las tarjetas y gráficos del panel.

## API e imágenes

`VITE_API_URL` es el origen de la API, sin `/api` al final. Con valor vacío, las solicitudes van al mismo origen. En desarrollo, Vite reenvía `/api` y `/uploads` al backend del puerto `3000`.

`utils/productImage.ts` resuelve tres fuentes de imagen:

1. `/uploads/...`: archivos servidos por la API.
2. Direcciones HTTP/HTTPS: URLs que la interfaz usa directamente.
3. Nombres exportados desde `assets/images/index.ts`: imágenes incluidas en el cliente, como `MonsteraDeliciosa`.

Al agregar una imagen incluida en el proyecto, revisá su exportación y la referencia almacenada. Para las imágenes cargadas desde el panel, ver [API](api.md#productos-e-imágenes).

## Búsqueda y ubicación

El buscador público consulta productos y lleva al listado con el parámetro `q`. Los filtros se apoyan en `utils/productSearch.ts`; las ofertas se identifican por la lista de etiquetas, independientemente de la etiqueta visible.

`utils/googleMaps.ts` carga Google Maps para geocodificar y autocompletar direcciones. `utils/location.ts` contiene la lógica local de ciudades de entrega: San Luis y Villa Mercedes. No confundir esa comprobación de interfaz con una restricción equivalente del servidor: el checkout de la API valida coordenadas, pero no impone esos radios geográficos.

## Al modificar una pantalla

Reutilizá los contextos y utilidades del módulo, contemplá carga/error/vacío y verificá la vista pública en celular y el panel en escritorio. Los mensajes de la interfaz están en español. Para compilar, ejecutar lint y probar el tablero, ver [comandos de verificación](desarrollo.md#comandos-de-verificación).
