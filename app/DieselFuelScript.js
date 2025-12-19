import { execSync } from "child_process";
import { URL as NodeURL } from "node:url";

globalThis.URL = NodeURL;

// ---------- CONFIG ----------
const SERVER = "10.0.15.81";
const USER = "web_user";
const PASS = "!Nf0ZZvMkV6FrXh";
const DB = "Commodities";
const TABLE = "Diesel_Fuel_Market";

const FRED_KEY = "c082c0d216f4b094c6c0a7c39d65571b";
const SERIES_ID = "GASDESW"; // weekly diesel series
// ----------------------------

console.log("hit the file");
export async function runDiesel() {
  console.log("hit the function");
  try {
    // Fetch ONLY most recent diesel price
    console.log("Fetching latest diesel price from FRED...");
    const link =
      `https://api.stlouisfed.org/fred/series/observations?` +
      `series_id=${SERIES_ID}` +
      `&api_key=${FRED_KEY}` +
      `&file_type=json` +
      `&sort_order=desc&limit=1`;

    console.log("url", link);

    // const { data } = await axios.get(url);
    const response = await fetch(link);
    const data = await response.json();
    const obs = data.observations[0];

    console.log("Observation data:", obs);

    if (!obs || obs.value === ".") {
      return;
    }

    const closeValue = parseFloat(obs.value);
    const date = obs.date;

    console.log("Latest Diesel:", closeValue, date);

    // INSERT ONLY — always add a new record
    const sql = `
INSERT INTO ${TABLE} ([Commodity], [Close], [Date])
VALUES ('Diesel Fuel', ${closeValue}, '${date}');
`;

    const cmd = `sqlcmd -S ${SERVER} -U ${USER} -P "${PASS}" -d ${DB} -Q "${sql}"`;

    execSync(cmd, { stdio: "inherit" });

    console.log("New Diesel record inserted successfully.");
  } catch (err) {
    console.error("ERROR inserting diesel data:", err.message);
  }
}
