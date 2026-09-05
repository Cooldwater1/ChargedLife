import fs from "node:fs";

const page=fs.readFileSync("app/page.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const data=fs.readFileSync("lib/game/fastFood/data.ts","utf8");
const migration=fs.readFileSync("lib/game/fastFood/migration.ts","utf8");
const dashboard=page.slice(page.indexOf("function Dashboard("),page.indexOf("function EmpireOverview"));
const checks=[
  [pkg.version==="1.0.56","package version"],
  [page.includes('Pre-Alpha 1.0.56'),"visible version"],
  [data.includes('version:"1.0.56"'),"new game version"],
  [migration.includes('1.0.56'),"migration version"],
  [pkg.scripts["verify:v1056"]==="node scripts/verify-v1056.mjs","verify script registered"],
  [dashboard.includes('dashboardV56'),"new dashboard markup"],
  [dashboard.includes('Opening Setup Progress'),"setup progress callout"],
  [!dashboard.includes('<RestaurantVisual'),"dashboard has no restaurant artwork"],
  [css.includes('dashboardV56')&&css.includes('actionGridV56'),"dashboard styles"],
  [page.includes('Fast Food')&&page.includes('AVAILABLE NOW'),"fast food remains only available industry"],
];
for(const [ok,name] of checks){
  if(!ok) throw new Error(`Failed: ${name}`);
  console.log(`PASS ${name}`);
}
