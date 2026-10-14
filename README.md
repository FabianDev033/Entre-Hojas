# Entre Hojas

**Entre Hojas** es una aplicación web desarrollada para un vivero especializado en plantas de interior.

El proyecto está compuesto por dos partes principales:

* **Sitio web público**, donde los clientes pueden explorar el catálogo de plantas, conocer información detallada sobre cada producto y realizar consultas o compras de forma simple e intuitiva.
* **Panel de administración**, diseñado para facilitar la gestión diaria del vivero mediante herramientas para administrar productos, procesar órdenes y visualizar analíticas del negocio.

El objetivo es centralizar la operación del vivero en una plataforma moderna, rápida y fácil de usar, ofreciendo una excelente experiencia tanto para los clientes como para los administradores.

## Funcionalidades

### Sitio web

* Catálogo de plantas.
* Búsqueda y filtrado de productos.
* Información detallada de cada planta.
* Diseño responsive para dispositivos móviles y escritorio.

### Panel de administración

* Gestión de productos.
* Gestión de órdenes.
* Dashboard con analíticas e indicadores del negocio.
* Administración del contenido del sitio.

## Tecnologías

* React
* TypeScript
* Vite
* Tailwind CSS
* Node Js
* Express

## Estado del proyecto

### Probar desde el celular

1. Conectá la PC y el celular a la misma red.
2. En `client/.env`, dejá `VITE_API_URL=` vacío. Así las llamadas a `/api` y las imágenes de `/uploads` usan el mismo origen que la página.
3. Ejecutá `pnpm dev` desde la raíz del proyecto. Si ya estaba ejecutándose, reinicialo para cargar la configuración.
4. Abrí en el celular la dirección `http://<IP-local-de-la-PC>:5173` que Vite muestra como **Network**. Podés consultar la IP con `ipconfig` en Windows.

Vite escucha en la red y reenvía `/api` y `/uploads` al backend en `127.0.0.1:3000`. La API debe estar ejecutándose en ese puerto. No hace falta configurar port forwarding en el router. Si la página no abre, verificá que el Firewall de Windows permita Node.js en la red privada y que el Wi-Fi no sea una red de invitados con aislamiento entre dispositivos.

Esta configuración corresponde al servidor de desarrollo. En producción, configurá `VITE_API_URL` con la URL de la API o un proxy equivalente en el servidor web.

🚧 Actualmente en desarrollo.

## Equipo

Desarrollado por:

* Fabián Barzola
* Marcos Coloma
