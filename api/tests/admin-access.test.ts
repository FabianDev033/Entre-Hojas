import assert from "node:assert/strict";
import { after, test } from "node:test";
import type { AddressInfo } from "node:net";
import type { RequestHandler } from "express";

// Exercise the real router and authentication without accessing a database.
process.env.DB_HOST = "127.0.0.1";
process.env.DB_NAME = "auth_test";
process.env.DB_USER = "auth_test";
process.env.JWT_SECRET = "local-auth-regression-test";

const controllers = await Promise.all([
  import("../src/controllers/cliente.controller.js"),
  import("../src/controllers/dashboard.controller.js"),
  import("../src/controllers/imagen.controller.js"),
  import("../src/controllers/orden.controller.js"),
  import("../src/controllers/orden-detalle.controller.js"),
  import("../src/controllers/planta.controller.js"),
]);

for (const { default: controller } of controllers) {
  for (const name of Object.keys(controller)) {
    const handler: RequestHandler = (_request, response) => {
      response.json({ handler: name });
    };
    Object.assign(controller, { [name]: handler });
  }
}

const { default: app } = await import("../src/app.js");
const { createAuthToken } = await import("../src/utils/auth-token.js");
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((resolve) => server.once("listening", resolve));
const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
after(() => new Promise<void>((resolve) => server.close(() => resolve())));

const protectedRoutes = [
  ["GET", "/dashboard"],
  ["GET", "/ordenes"],
  ["PATCH", "/ordenes/1/estado"],
  ["POST", "/ordenes"],
  ["DELETE", "/ordenes/1"],
  ["GET", "/clientes"],
  ["GET", "/orden-detalles"],
  ["GET", "/orden-detalles/1/1"],
  ["GET", "/productos/inventario"],
  ["PATCH", "/productos/1/stock"],
  ["POST", "/plantas"],
  ["PATCH", "/plantas/1"],
  ["DELETE", "/productos/1"],
  ["POST", "/imagenes"],
];

test("administrative endpoints reject missing or invalid sessions", async () => {
  for (const [method, path] of protectedRoutes) {
    for (const cookie of ["", "auth_token=invalid.session.token"]) {
      const response = await fetch(baseUrl + path, { method, headers: { cookie } });
      assert.equal(response.status, 401, `${method} ${path}`);
    }
  }
});

test("a valid administrator session can reach the protected handlers", async () => {
  const { token } = createAuthToken({ id: 1, user: "admin-test" });
  for (const [method, path] of protectedRoutes) {
    const response = await fetch(baseUrl + path, {
      method,
      headers: { cookie: `auth_token=${token}` },
    });
    assert.equal(response.status, 200, `${method} ${path}`);
    assert.ok((await response.json()).handler);
  }
});

test("expired sessions cannot load administrative data", async (context) => {
  context.mock.timers.enable({ apis: ["Date"], now: 0 });
  const { token } = createAuthToken({ id: 1, user: "admin-test" });
  context.mock.timers.reset();
  const response = await fetch(`${baseUrl}/ordenes`, {
    headers: { cookie: `auth_token=${token}` },
  });
  assert.equal(response.status, 401);
});

test("catalog, checkout and customer order pages remain public", async () => {
  const publicRoutes = [
    ["GET", "/plantas", "findAll"],
    ["GET", "/plantas/1", "findById"],
    ["GET", "/plantas/familia/interior", "findByFamily"],
    ["GET", "/productos", "findAll"],
    ["GET", "/productos/1", "findById"],
    ["GET", "/productos/familia/interior", "findByFamily"],
    ["GET", "/imagenes", "findAll"],
    ["GET", "/imagenes/1", "findById"],
    ["POST", "/ordenes/checkout", "checkout"],
    ["GET", "/ordenes/1", "findOrderDetailById"],
  ];
  for (const [method, path, handler] of publicRoutes) {
    const response = await fetch(baseUrl + path, { method });
    assert.equal(response.status, 200, `${method} ${path}`);
    assert.deepEqual(await response.json(), { handler });
  }
});
