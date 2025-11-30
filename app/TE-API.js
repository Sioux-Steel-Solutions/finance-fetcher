import axios from "axios";
import { execSync } from "child_process";

const SERVER = "10.0.15.81";
const USER = "web_user";
const PASS = "!Nf0ZZvMkV6FrXh";
const DB = "Commodities";

const TE_KEY = "888C90D60C51422:5A85163EF0B6422";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runSQL(sql) {
  const cmd = `sqlcmd -S ${SERVER} -U ${USER} -P "${PASS}" -d ${DB} -Q "${sql}"`;
  execSync(cmd, { stdio: "inherit" });
}

function existsInTable(table, dateColumn, dateValue) {
  const sql = `
    SELECT COUNT(*) AS Cnt
    FROM ${table}
    WHERE ${dateColumn} = '${dateValue}';
  `;

  try {
    const result = execSync(
      `sqlcmd -S ${SERVER} -U ${USER} -P "${PASS}" -d ${DB} -h -1 -Q "${sql}"`
    )
      .toString()
      .trim();

    return parseInt(result) > 0;
  } catch (err) {
    console.error(`Duplicate-check failed for ${table}:`, err.message);
    return false;
  }
}

async function fetchAllCommodities() {
  try{ const url = `https://api.tradingeconomics.com/markets/commodities?c=${TE_KEY}`;
  const { data } = await axios.get(url);
  return data;}
  catch(e){console.log(e)
    return
  }
  
 
}

function insertCorn(row) {
  const date = row.Date;

  if (existsInTable("Corn_Market", "[Date]", date)) {
    console.log(`Corn already inserted for ${date}. Skipping.`);
    return;
  }

  const sql = `
    INSERT INTO Corn_Market ([Commodity], [Date], [Close])
    VALUES ('Corn', '${row.Date}', ${row.Close});
  `;
  runSQL(sql);
  console.log(`Inserted Corn for ${date}`);
}

// ---- Soybeans ----
function insertSoybeans(row) {
  const date = row.Date;

  if (existsInTable("Soy_Bean_Market", "[Date]", date)) {
    console.log(`Soybeans already inserted for ${date}. Skipping.`);
    return;
  }

  const sql = `
    INSERT INTO Soy_Bean_Market ([Commodity], [Date], [Close])
    VALUES ('Soy Beans', '${row.Date}', ${row.Close});
  `;
  runSQL(sql);
  console.log(`Inserted Soybeans for ${date}`);
}

// ---- Hot Rolled Coil ----
function insertHotRolledCoil(row) {
  const date = row.Date;

  if (existsInTable("Hot_Rolled_Coil_Market", "[Date]", date)) {
    console.log(`HRC already inserted for ${date}. Skipping.`);
    return;
  }

  const sql = `
    INSERT INTO Hot_Rolled_Coil_Market
    ([Commodity], [Close], [Date], [Open], [High], [Low])
    VALUES (
      'HRC',
      ${row.Close},
      '${row.Date}',
      ${row.open},
      ${row.day_high},
      ${row.day_low}
    );
  `;

  runSQL(sql);

  console.log(`Inserted HRC for ${date}`);
}


// =============================
// MAIN
// =============================
export async function runTE() {
  console.log("Fetching commodities...");
  const commodities = await fetchAllCommodities();

  // Extract commodity rows
  const corn = commodities.find((x) => x.URL === "/commodity/corn");
  const soy = commodities.find((x) => x.URL === "/commodity/soybeans");
  const hrc = commodities.find((x) => x.URL === "/commodity/hrc-steel");

  // Debug objects
  console.log("Corn object:", corn);
  console.log("Soy object:", soy);
  console.log("HRC object:", hrc);
  // Inserts
  if (corn) insertCorn(corn);
  if (soy) insertSoybeans(soy);
  if (hrc) insertHotRolledCoil(hrc);

  console.log("All Trading Economics inserted successfully.");
}

runTE();
