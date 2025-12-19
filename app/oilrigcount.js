import axios from "axios";
import { execSync } from "child_process";
import fs from "fs";
import te from "tradingeconomics";

// =========================================
// CONFIG
// =========================================
const SERVER = "10.0.15.81";
const USER = "web_user";
const PASS = "!Nf0ZZvMkV6FrXh";
const DB = "Commodities";

const TE_KEY = "888C90D60C51422:5A85163EF0B6422";

// Login to TE API
te.login(TE_KEY);

// =========================================
// UTILS
// =========================================
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Throttled TE requests — ensures we NEVER hit rate limit
async function throttledTECall(fn, ...args) {
  await sleep(1250); // 1.25 seconds delay to avoid TE rate limit

  try {
    return await fn(...args);
  } catch (err) {
    // If TE rate-limits us (409), retry once after waiting
    if (err?.response?.status === 409) {
      console.warn("TE RATE LIMIT (409). Retrying after 2 sec...");
      await sleep(2000);
      return await fn(...args);
    }

    console.error("TradingEconomics API Error:", err?.response?.data || err);
    return null;
  }
}

// =========================================
// SQL EXECUTOR
// =========================================
function runSQL(sql) {
  const cmd = `sqlcmd -S ${SERVER} -U ${USER} -P "${PASS}" -d ${DB} -Q "${sql}" -b`;
  execSync(cmd, { stdio: "inherit" });
}

// =========================================
// DUPLICATE CHECK
// =========================================
function existsInTable(dateValue) {
  const sql = `
    SELECT COUNT(*) AS Cnt
    FROM US_Oil_Rig_Count
    WHERE [Date] = '${dateValue}';
  `;

  try {
    const result = execSync(
      `sqlcmd -S ${SERVER} -U ${USER} -P "${PASS}" -d ${DB} -h -1 -Q "${sql}"`
    )
      .toString()
      .trim();

    return parseInt(result) > 0;
  } catch (err) {
    console.error("Duplicate-check failed:", err.message);
    return false;
  }
}

// =========================================
// MAIN FETCH + INSERT
// =========================================
export async function runOil() {
  try {
    console.log("Fetching ENERGY indicators for the United States...");

    // ---- TE FETCH (THROTTLED + RETRY SAFE) ----
    const indicators = await throttledTECall(
      te.getIndicatorData,
      (country = "united states"),
      (group = "energy")
    );

    if (!indicators || !Array.isArray(indicators)) {
      console.error(
        "TradingEconomics returned invalid indicator data:",
        indicators
      );
      return;
    }

    // Find the Oil Rig Count indicator
    const oilRig = indicators.find(
      (x) =>
        x?.Category?.toLowerCase().includes("rig") ||
        x?.Title?.toLowerCase().includes("rig")
    );

    if (!oilRig) {
      console.log("Oil Rig Count not found in TE indicator results.");
      return;
    }

    console.log("TE Oil Rig Object:", oilRig);

    // Extract values
    const Country = "United States";
    const Commodity = "Crude Oil Rigs";
    const Date = oilRig.LatestValueDate || oilRig.Date;
    const Count = oilRig.LatestValue || oilRig.Last;
    const Frequency = oilRig.Frequency || "Weekly";
    const Historical_Data_Symbol = oilRig.HistoricalDataSymbol || "USOILRIGS";
    const LastUpdate = oilRig.LatestValueDate || new Date().toISOString();

    if (!Date || !Count) {
      console.log("Missing Date or Count — cannot insert.");
      return;
    }

    // Prevent duplicates
    if (existsInTable(Date)) {
      console.log(`Oil Rig Count already inserted for ${Date}. Skipping.`);
      return;
    }

    // SQL insert
    const sql = `
      INSERT INTO US_Oil_Rig_Count
      ([Country], [Commodity], [Date], [Count], [Frequency], [Historical_Data_Symbol], [LastUpdate])
      VALUES (
        '${Country}',
        '${Commodity}',
        CONVERT(datetime, '${Date}', 126),
        ${Count},
        '${Frequency}',
        '${Historical_Data_Symbol}',
        CONVERT(datetime, '${LastUpdate}', 126)
      );
    `;

    console.log("Running SQL Insert...");
    runSQL(sql);

    console.log(`Inserted Oil Rig Count for ${Date}: Count = ${Count}`);
  } catch (err) {
    console.error("Error fetching/inserting oil rig count:", err);
  }
}
