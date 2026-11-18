# Reglas de negocio

[Índice de documentación](README.md).

Este documento describe lo que implementa el código actual. Las decisiones todavía abiertas aparecen identificadas como tales.

## Productos y disponibilidad

Un producto se puede comprar cuando `habilitado` es verdadero y tiene stock suficiente. Deshabilitarlo no borra sus unidades. El catálogo conserva visibles los productos deshabilitados o con stock cero y los presenta como no disponibles; el checkout vuelve a validar la disponibilidad en el servidor.

| Campo | Regla del editor administrativo |
| --- | --- |
| Precio | No negativo, hasta dos decimales y máximo `99.999.999,99`. |
| Descuento | Porcentaje entero entre `0` y `100`. |
| Tamaño (`tamano`) | `Pequeño`, `Mediano`, `Grande` o sin especificar. |
| Iluminación y resistencia | `Poca`, `Media`, `Mucha` o sin especificar. |
| Cuidado | `Fácil`, `Medio`, `Difícil` o sin especificar. |
| Aptitud para mascotas (`petFriendly`) | `true`, `false` o `null` para sin especificar. No acepta textos como `"false"`. |
| Disponibilidad (`habilitado`) | Booleano. Los productos nuevos se habilitan por defecto. |

La migración de aptitud para mascotas deja los productos anteriores en `null`: no deduce esa característica. Omitir `petFriendly` o `habilitado` en una edición conserva el valor existente. Los textos históricos fuera de las opciones del editor requieren elegir una opción válida para guardar.

### Etiquetas

Se pueden asignar varias: `promo`, `oferta`, `ultimo`, `top`, `nuevo`, `volvio`, `elegido`, `limitada` y `regalo`.

- `etiquetas` contiene todas las asignadas y `etiqueta` indica cuál se muestra en la tarjeta.
- La etiqueta visible debe pertenecer a la selección. Sin etiquetas, debe quedar vacía o `null`.
- Incluir `oferta` requiere un descuento mayor que cero, aunque la tarjeta muestre otra etiqueta.
- El filtro de ofertas consulta todas las etiquetas, no solamente la visible.

## Órdenes y stock

El checkout crea una orden en estado `pendiente`, guarda cliente y detalle, calcula precios con los descuentos vigentes y descuenta el stock en una sola transacción. Bloquea las plantas consultadas durante la operación para comprobar las existencias antes de guardar. Agregar al carrito no reserva unidades.

| Estado API | Nombre en el tablero |
| --- | --- |
| `pendiente` | En proceso |
| `listo` | Listo para envío |
| `enviado` | Enviado |
| `confirmado` | Confirmado |
| `cancelado` | Cancelado |

La API admite esos cinco valores. Actualmente no impone un orden de transiciones: cambiar de columna actualiza el estado y su fecha. Si falla el guardado desde el tablero, la interfaz vuelve a la organización anterior.

**Decisión pendiente:** cancelar una orden actualiza su estado, pero no reintegra stock. Confirmar, reabrir o mover a otra columna tampoco altera inventario. No asumir que hay una devolución automática por cambiar el estado.

Las órdenes confirmadas y canceladas solo se muestran en sus columnas durante la semana actual, definida en el cliente desde el lunes. Permanecen en los datos cargados y se pueden localizar mediante el buscador del tablero. La posición de una tarjeta dentro de una columna no tiene un campo de orden persistido en MySQL.

Los medios de pago son transferencia, Mercado Pago y efectivo. Actualmente se guarda la opción elegida; no hay un cobro o una verificación automática de pago. La coordinación de entrega y contacto se apoya en los datos de la orden y los enlaces del panel.

## Compras e inventario

**Diseño previsto del módulo en desarrollo en `fayan`.** Esta rama no incorpora los formularios, endpoints ni la migración de compras descritos a continuación. El dashboard actual ya consulta las tablas de compras para sus indicadores; la gestión y las anulaciones automáticas pertenecen al trabajo separado.

Una compra registra fecha, proveedor, observaciones e ítems. Las plantas se vinculan al inventario; macetas, insumos, herramientas y otros se registran como gasto sin inventario propio.

| Operación sobre una compra nueva | Efecto |
| --- | --- |
| Crear | Suma las unidades de sus plantas. |
| Editar | Aplica la diferencia entre las cantidades anteriores y las nuevas. |
| Anular | Retira las unidades aplicadas y conserva el importe y el detalle original. |

Ejemplo: una compra ingresa cinco potus y luego se corrige a tres. La edición resta dos unidades al stock actual. Si esas unidades ya no están disponibles, se rechaza toda la operación para evitar stock negativo.

Las líneas repetidas de una misma planta se suman antes de calcular las diferencias. Compra, detalle y stock se guardan en una transacción. La versión de la compra se incrementa al editar o anular; guardar una versión antigua devuelve un conflicto para evitar sobrescribir un cambio simultáneo.

### Compras anteriores

La migración agrega `stock_aplicado = false` a las compras existentes. No se puede deducir si sus unidades ya habían ingresado manualmente; editarlas o anularlas no mueve stock. La interfaz señala esa condición.

Las compras nuevas del módulo previsto guardan `stock_aplicado = true` y gestionan su inventario automáticamente. No cambiar ese indicador para reproducir compras antiguas.

### Totales y listado

Los importes de compras se calculan en centavos para sumar precios con dos decimales. Anular no borra los importes. Las compras anuladas se excluyen de gastos vigentes y futuros cierres mensuales.

Las tarjetas del listado resumen todas las compras vigentes del período seleccionado, incluso si la búsqueda de texto reduce las filas visibles o se activa la opción de mostrar anuladas. Las fechas `desde` y `hasta` son inclusivas.

## Ventas y cierres mensuales

Las ventas se calculan con órdenes `confirmado` y con el valor histórico `entregado`, que se considera equivalente en estadísticas y ventas por planta. El checkout guarda el precio unitario del pedido; editar luego el precio del producto no recalcula esos detalles.

El valor promedio usa las ventas divididas por la cantidad de órdenes confirmadas. La ganancia mostrada en el dashboard se calcula como ventas menos compras; no incorpora costos que no estén registrados en esas compras y no representa un cálculo contable completo.

El servicio de estadísticas guarda cada mes finalizado una sola vez en `monthly_statistics`. Se ejecuta al iniciar la API, al solicitar el dashboard y mediante una programación al comienzo del mes siguiente. Si el proceso estuvo detenido, intenta completar los meses faltantes.

Una vez guardado un mes, sus valores permanecen inmutables. Editar una orden o anular una compra de ese período no recalcula el cierre ya registrado. Al completar un cierre que faltaba, se usa el estado de los datos disponible en ese momento.

Las consultas mensuales usan la fecha de actividad, no un registro de cada transición de estado. Node.js y MySQL consultan sus respectivos relojes: mantener una zona horaria coherente en ambos para evitar discrepancias en los límites de mes.
