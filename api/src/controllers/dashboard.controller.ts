import { asyncHandler } from "../utils/async-handler.js";
import dashboardService from "../services/dashboard.service.js";

const getDashboard = asyncHandler(async (_request, response) => {
  response.json(await dashboardService.getDashboard());
});

export default { getDashboard };
