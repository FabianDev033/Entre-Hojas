import { createCrudController } from "./crud.controller.js";
import userService from "../services/user.service.js";
export default createCrudController(userService, ["user", "password"], ["id"], ["id", "user", "password"]);
