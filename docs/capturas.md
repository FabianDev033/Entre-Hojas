# Capturas y GIF

[Índice de documentación](README.md).

Los recursos del README están en `docs/assets/`. Muestran el frontend real ejecutándose localmente con datos ficticios. No son diseños generados ni capturas de una base del vivero.

| Archivo | Contenido |
| --- | --- |
| `logo.webp` | Versión reducida del logo existente para el README. |
| `inicio-movil.webp` | Inicio en una vista de celular. |
| `catalogo-movil.webp` | Catálogo con fotografías incluidas en el proyecto. |
| `dashboard.webp` | Panel con indicadores de demostración. |
| `ordenes.gif` | Interacción con el tablero usando órdenes ficticias. |

## Abrir la vista de documentación

Desde la raíz:

```sh
pnpm --dir client install
node docs/preview.mjs
```

| Pantalla | URL |
| --- | --- |
| Inicio | [http://127.0.0.1:4173](http://127.0.0.1:4173) |
| Catálogo | [http://127.0.0.1:4173/categories/Todo](http://127.0.0.1:4173/categories/Todo) |
| Dashboard | [http://127.0.0.1:4173/admin](http://127.0.0.1:4173/admin) |
| Órdenes | [http://127.0.0.1:4173/admin/ordenes](http://127.0.0.1:4173/admin/ordenes) |

El script inicia Vite en `4173` y un servidor de datos ficticios en `4174`, ambos limitados a `127.0.0.1`. No importa la API, no conecta con MySQL y no modifica los archivos `.env`. Sobrescribe la URL de la API y desactiva la clave de Google Maps solo dentro de esta ejecución de Vite.

La sesión de demostración se responde desde ese servidor temporal. Las órdenes permiten mover tarjetas y conservan sus cambios solo en memoria hasta reiniciar el script. No implementa compras, inventario administrativo, guardado de productos, autenticación real ni checkout. Sirve para capturar y recorrer estas pantallas, no para validar persistencia o seguridad.

Detenelo con `Ctrl+C`. Si uno de los puertos está ocupado, cerrá la otra ejecución antes de volver a iniciarlo.

## Renovar los archivos

1. Abrí la pantalla y esperá a que carguen tipografías, fotografías y gráficos.
2. Usá una vista móvil para inicio y catálogo y una vista de escritorio para el panel. Evitá mezclar tamaños dentro de una misma animación.
3. Capturá el contenido de la página sin herramientas de desarrollo, notificaciones del sistema ni datos personales.
4. Para el GIF, grabá un recorrido corto del tablero: estado inicial, movimiento de una tarjeta y consulta del detalle. Dejá una pausa para que se entienda cada estado y evitá saltos al reiniciar el bucle.
5. Exportá las capturas a WebP y el recorrido a GIF. Conservá los nombres de la tabla para mantener los enlaces del README.
6. Abrí los archivos exportados y revisá legibilidad, encuadre, tamaño y reproducción. Para sumar material, enlazalo desde esta guía y elegí solo las vistas más útiles para el README principal.

El GIF incluido reúne capturas sucesivas de una interacción real; no es una validación del backend. Mantené la aclaración de datos de demostración cuando se compartan estas imágenes.

Las capturas móviles se recortaron para quitar únicamente las barras de desplazamiento. El GIF se exportó a `960 × 675` con una paleta compartida para reducir el peso sin cambiar los estados de la interfaz.
