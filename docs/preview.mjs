// Vista local para renovar las capturas: usa la UI real y datos ficticios en memoria.
// No importa la API ni abre conexiones a MySQL. No usar como servidor de producción.
import { createServer as createHttpServer } from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requireClient = createRequire(resolve(root, 'client/package.json'));
const { createServer: createViteServer } = await import(pathToFileURL(requireClient.resolve('vite')).href);
const now = new Date().toLocaleString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' }).replace(' ', 'T') + '-03:00';
const month = (offset) => {
  const date = new Date();
  return new Date(Date.UTC(date.getFullYear(), date.getMonth() + offset, 1)).toISOString().slice(0, 10);
};
const plants = [
  ['Monstera', 'Deliciosa', 'MonsteraDeliciosa', 22500, 'elegido', 0],
  ['Potus', 'Marble Queen', 'PotusMarbleQueen', 12500, 'oferta', 15],
  ['Singonio', 'Rosado', 'SingonioRosado', 9800, 'nuevo', 0],
  ['Calathea', 'Triostar', 'CalatheaTriostar', 18700, 'top', 0],
  ['Monstera', 'Adansonii', 'MonsteraAdansonii', 16000, 'ultimo', 0],
  ['Potus', 'Lemon', 'PotusLemon', 8900, 'oferta', 10],
  ['Maranta', 'Leuconeura', 'MarantaLeuconeura', 14500, 'elegido', 0],
  ['Singonio', 'Variegado', 'SingonioVariegado', 11900, 'volvio', 0],
].map(([family, name, image, price, label, discount], index) => ({
  id: index + 1, family, name, image, price, label, labels: [label], discount,
  stock: 8 + index, habilitado: true,
}));
const details = plants.map((plant) => ({
  id: plant.id, nombre: plant.name, familia: plant.family, precio: plant.price,
  stock: plant.stock, habilitado: true, discount: plant.discount,
  etiqueta: plant.label, etiquetas: plant.labels, petFriendly: null,
  origen: 'América tropical', tipo: 'Interior', iluminacion: 'Media', resistencia: 'Media',
  tamano: 'Mediano', cuidado: 'Fácil', ventas: 12,
  descripcion: 'Una planta de interior para sumar vida a tus espacios. Preferí la luz indirecta y regá cuando el sustrato comience a secarse.',
  imagenes: [{ id: plant.id, plantas_id: plant.id, url: plant.image }],
}));
const orders = ['pendiente', 'pendiente', 'pendiente', 'listo', 'listo', 'enviado', 'confirmado', 'cancelado']
  .map((estado, index) => ({
    id: 101 + index, fecha: now, estadoActualizado: now, estado,
    total: plants[index].price * 2, clientes_id: index + 1,
    cliente: { nombre: `Cliente demo ${index + 1}`, telefono: null },
    direccion: 'Dirección de ejemplo, San Luis', detalleUbicacion: 'Datos ficticios para la documentación',
    latitud: null, longitud: null, medioPago: ['transferencia', 'efectivo', 'mercado_pago'][index % 3],
    items: [{ plantId: index + 1, nombre: plants[index].name, familia: plants[index].family,
      cantidad: 2, precioUnitario: plants[index].price, subtotal: plants[index].price * 2 }],
  }));
const summaryOrders = { pendiente: 8, listo: 5, enviado: 4, confirmado: 26, cancelado: 2 };
const history = Array.from({ length: 4 }, (_, index) => {
  const sales = [340000, 412000, 485000, 589000][index];
  const purchases = [115000, 142000, 166000, 185000][index];
  return { month: month(index - 3), sales, orders: 30 + index * 5,
    confirmedOrders: 20 + index * 2, averageOrderValue: Math.round(sales / (20 + index * 2)),
    purchases, profit: sales - purchases };
});
const performance = Array.from({ length: 12 }, (_, index) => {
  if (index >= 8) return { ...history[index - 8], revenue: history[index - 8].sales };
  const sales = 220000 + index * 28000 + (index % 3) * 12000;
  const purchases = 85000 + index * 8000;
  return { month: month(index - 11), sales, revenue: sales, orders: 20 + index * 2,
    confirmedOrders: 15 + index, averageOrderValue: Math.round(sales / (15 + index)),
    purchases, profit: sales - purchases };
});
const dailySeries = (total, count) => {
  const weights = Array.from({ length: count }, (_, index) => 7 + (index * 7) % 9);
  const sum = weights.reduce((a, b) => a + b, 0);
  let allocated = 0;
  return weights.map((weight, index) => {
    const value = index === count - 1 ? total - allocated : Math.floor(total * weight / sum);
    allocated += value;
    return value;
  });
};
const currentDaily = dailySeries(history[3].sales, new Date().getDate());
const previousDaily = dailySeries(history[2].sales, new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate());
const dashboard = {
  salesTotal: 589000, salesPrev: 21.4, orderTotal: 45, orderPrev: 12.5,
  averageOrderValue: 22654, averageOrderValuePrev: 8.2, purchasesTotal: 185000, purchasesPrev: 11.4,
  summaryOrders, history, performance,
  stock: details.slice(0, 4).map((plant) => ({ id: plant.id,
    nombre: `${plant.familia} ${plant.nombre}`, stock: plant.stock, actualizado: now })),
  performanceComparison: {
    current: { ...history[3], summaryOrders }, previous: { ...history[2], summaryOrders },
    days: Array.from({ length: 31 }, (_, index) => ({ day: index + 1,
      current: { ...history[3], day: index + 1, sales: currentDaily[index] ?? 0, summaryOrders },
      previous: { ...history[2], day: index + 1, sales: previousDaily[index] ?? 0, summaryOrders },
    })),
  },
};
const send = (response, status, value) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
};
const api = createHttpServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (request.method === 'GET') {
    if (path === '/api/auth/me') return send(response, 200, { user: { id: 1, user: 'Demo' } });
    if (path === '/api/dashboard') return send(response, 200, dashboard);
    if (path === '/api/ordenes') return send(response, 200, orders);
    if (path.startsWith('/api/plantas/familia/')) {
      const family = path.split('/').at(-1);
      return send(response, 200, family === 'AllPlants' ? plants : plants.filter((plant) => plant.family === family));
    }
    if (path === '/api/plantas' || path === '/api/productos') return send(response, 200, details);
    const detail = path.match(/^\/api\/(?:plantas|productos)\/(\d+)$/);
    if (detail) {
      const plant = details.find((plant) => plant.id === Number(detail[1]));
      return send(response, plant ? 200 : 404, plant ?? { error: 'Producto demo inexistente.' });
    }
  }
  const statusRoute = path.match(/^\/api\/ordenes\/(\d+)\/estado$/);
  if (request.method === 'PATCH' && statusRoute) {
    const order = orders.find((order) => order.id === Number(statusRoute[1]));
    let body = '';
    for await (const chunk of request) body += chunk;
    try {
      const { estado } = JSON.parse(body);
      if (!order || !['pendiente', 'listo', 'enviado', 'confirmado', 'cancelado'].includes(estado)) {
        return send(response, 400, { error: 'Estado demo inválido.' });
      }
      order.estado = estado;
      order.estadoActualizado = new Date().toISOString();
      return send(response, 200, order);
    } catch {
      return send(response, 400, { error: 'JSON inválido.' });
    }
  }
  return send(response, 404, { error: 'La vista de documentación solo implementa catálogo, dashboard y órdenes.' });
});
await new Promise((resolve, reject) => {
  api.once('error', reject);
  api.listen(4174, '127.0.0.1', resolve);
});
let vite;
try {
  vite = await createViteServer({
    root: resolve(root, 'client'), configFile: resolve(root, 'client/vite.config.ts'),
    define: { 'import.meta.env.VITE_API_URL': JSON.stringify(''), 'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify('') },
    server: { host: '127.0.0.1', port: 4173, strictPort: true,
      proxy: { '/api': 'http://127.0.0.1:4174', '/uploads': 'http://127.0.0.1:4174' } },
  });
  await vite.listen();
  console.log('Vista de documentación: http://127.0.0.1:4173');
  console.log('UI real con datos ficticios en memoria. Sin MySQL. Ctrl+C para cerrar.');
} catch (error) {
  await vite?.close();
  api.close();
  throw error;
}
const stop = async () => { await vite.close(); api.close(); };
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
