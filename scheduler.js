#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";
import { URL as NodeURL } from "node:url";

globalThis.URL = NodeURL;

import { runDiesel } from "./app/DieselFuelScript.js";
import { runTE } from "./app/TE-API.js";
import { runOil } from "./app/oilrigcount.js";

// Ensure correct working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.chdir(__dirname);

console.log("URL typeof:", typeof URL);
console.log("URL value:", URL);
console.log("URL name:", URL?.name);

async function runSchedule() {
  console.log("Finance fetcher started at", new Date().toISOString());

  await runDiesel();
  await sleep(3000);

  // await runTE();
  // await sleep(3000);

  // await runOil();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
