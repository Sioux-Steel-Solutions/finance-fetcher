import axios from "axios";
import { execSync } from "child_process";

// ---------- CONFIG ----------
const SERVER = "10.0.15.81";
const USER = "web_user";
const PASS = "!Nf0ZZvMkV6FrXh";
const DB = "Commodities";
const TABLE = "Diesel_Fuel_Market";

const FRED_KEY = "e4aea3da7d765c0df96cc45e0595b515";
const SERIES_ID = "GASDESW";  // weekly diesel series
// ----------------------------


export async function runDiesel() {
  try {
    // Fetch ONLY most recent diesel price
    const url =
      `https://api.stlouisfed.org/fred/series/observations?` +
      `series_id=${SERIES_ID}` +
      `&api_key=${FRED_KEY}` +
      `&file_type=json` +
      `&sort_order=desc&limit=1`;

    const { data } = await axios.get(url);
    const obs = data.observations[0];

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


