import { runDiesel } from "./app/DieselFuelScript";
import { runTE } from "./app/TE-API";
import { runOil } from "./app/oilrigcount";
import { CronJob } from "cron";

const job = new CronJob(
  "0 18 * * 1-5",      // MON–FRI at 6:00 PM CST
  async () => {
    await runSchedule();
  },
  () => {
    console.log("Job Completed");
  },
  true,                // Start the job immediately
  "America/Chicago"    // Timezone
);

async function runSchedule() {
  console.log("Running 6pm schedule...");
  await runDiesel();
  await runTE();
  await runOil();
}

export default job;
