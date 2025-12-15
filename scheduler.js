#!/usr/bin/env node

import { runDiesel } from "./app/DieselFuelScript.js";
import { runTE } from "./app/TE-API.js";
import { runOil } from "./app/oilrigcount.js";
import { CronJob } from "cron";

const job = new CronJob(
  "0 18 * * 1-5", // MON–FRI at 6:00 PM CST
  async () => {
    await runSchedule();
  },
  () => {
    console.log("Job Completed");
  },
  false, // Start the job immediately
  "America/Chicago" // Timezone
);

async function runSchedule() {
  console.log("Running 6pm schedule...");
  // await runDiesel();
  // await sleep(3000);
  // await runTE();
  // await sleep(3000);
  // await runOil();
  // await sleep(3000);
}

export default job;

job.start();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
