import monthlyStatisticsModel from "../models/monthly-statistics.model.js";

// Node.js clamps timeouts greater than this value to 1 ms.
const MAX_TIMEOUT_MS = 2_147_483_647;

class MonthlyStatisticsService {
  private timer: NodeJS.Timeout | undefined;

  async captureCompletedMonths(): Promise<void> {
    await monthlyStatisticsModel.captureCompletedMonths();
  }

  start(): void {
    void this.captureCompletedMonths().catch((error: unknown) => {
      console.error("Unable to save monthly statistics.", error);
    });
    this.scheduleNextRun();
  }

  private scheduleNextRun(): void {
    const now = new Date();
    const nextRun = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 5, 0, 0);
    const delay = nextRun.getTime() - now.getTime();

    if (delay > MAX_TIMEOUT_MS) {
      this.timer = setTimeout(() => this.scheduleNextRun(), MAX_TIMEOUT_MS);
      return;
    }

    this.timer = setTimeout(() => {
      void this.captureCompletedMonths()
        .catch((error: unknown) => {
          console.error("Unable to save monthly statistics.", error);
        })
        .finally(() => this.scheduleNextRun());
    }, nextRun.getTime() - now.getTime());
  }

  stop(): void {
    if (this.timer) clearTimeout(this.timer);
  }
}

export default new MonthlyStatisticsService();
