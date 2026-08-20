import dashboardModel from "../models/dashboard.model.js";

class DashboardService {
  getDashboard() {
    return dashboardModel.getDashboard();
  }
}

export default new DashboardService();
