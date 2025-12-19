#!/usr/bin/env node

import { runDiesel } from "./app/DieselFuelScript.js";
import { runTE } from "./app/TE-API.js";
import { runOil } from "./app/oilrigcount.js";

async function runSchedule() {
  console.log("Running 6pm schedule...");
  await runDiesel();
  await sleep(3000);
  await runTE();
  await sleep(3000);
  await runOil();
  await sleep(3000);
}

runSchedule()
  .then(() => {
    console.log("Finance fetcher completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Finance fetcher FAILED", err);
    process.exit(1);
  });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
