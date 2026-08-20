import app from "./app.js";
import monthlyStatisticsService from "./services/monthly-statistics.service.js";

const PORT = process.env.PORT || '0.0.0.0';

monthlyStatisticsService.start();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
