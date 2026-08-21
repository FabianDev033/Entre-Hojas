import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import clienteController from "../controllers/cliente.controller.js";
import dashboardController from "../controllers/dashboard.controller.js";
import imagenController from "../controllers/imagen.controller.js";
import ordenController from "../controllers/orden.controller.js";
import ordenDetalleController from "../controllers/orden-detalle.controller.js";
import plantaController from "../controllers/planta.controller.js";
import { createCrudRouter } from "./crud.routes.js";

const router = Router();
router.post("/auth/login", authController.login);
router.post("/auth/logout", authController.logout);
router.get("/auth/me", authController.me);
router.get("/dashboard", dashboardController.getDashboard);
router.use("/clientes", createCrudRouter(clienteController));
router.get("/plantas/familia/:familia", plantaController.findByFamily);
router.use("/plantas", createCrudRouter(plantaController));
router.get("/productos/familia/:familia", plantaController.findByFamily);
router.use("/productos", createCrudRouter(plantaController));
router.use("/imagenes", createCrudRouter(imagenController));
router.post("/ordenes/checkout", ordenController.checkout);
router.get("/ordenes/:id", ordenController.findOrderDetailById);
router.use("/ordenes", createCrudRouter(ordenController));

router.route("/orden-detalles")
  .get(ordenDetalleController.findAll)
  .post(ordenDetalleController.create);
router.route("/orden-detalles/:ordenId/:plantaId")
  .get(ordenDetalleController.findByIds)
  .patch(ordenDetalleController.update)
  .delete(ordenDetalleController.delete);

export default router;
