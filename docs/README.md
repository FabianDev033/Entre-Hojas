# Documentación de Entre Hojas

[Volver al README principal](../README.md).

Estas guías describen el comportamiento del código actual. Cuando cambie una configuración, un endpoint o una regla del negocio, actualizá la guía correspondiente en el mismo cambio.

El módulo de compras se desarrolla por separado en `fayan`. Su diseño se conserva como referencia en las guías de API y reglas de negocio, marcado como previsto; su código y su roadmap no forman parte de esta rama.

| Necesito… | Leer |
| --- | --- |
| Instalar y ejecutar el proyecto con MySQL | [Desarrollo local](desarrollo.md) |
| Ver la interfaz sin preparar una base de datos | [Capturas y demostración](capturas.md) |
| Trabajar en endpoints, autenticación o persistencia | [API](api.md) |
| Modificar pantallas o el estado del cliente | [Frontend](frontend.md) |
| Entender cómo se mueve el inventario y se calculan las estadísticas | [Reglas de negocio](reglas-de-negocio.md) |
| Preparar una instalación de producción | [Despliegue](despliegue.md) |

## Criterio para documentar

- El README principal presenta el producto y da un punto de entrada.
- Las guías explican procedimientos y comportamientos que abarcan varios archivos.
- Los comentarios en el código explican decisiones locales que no resultan obvias, especialmente el motivo de una excepción.
- Los planes pendientes deben identificarse como pendientes; no describirlos como funciones disponibles.
- Los ejemplos y las capturas usan datos ficticios. Los secretos y las bases con información de clientes quedan fuera del repositorio.
