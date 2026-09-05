import fs from "node:fs";

const page=fs.readFileSync("app/page.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");
const data=fs.readFileSync("lib/game/fastFood/data.ts","utf8");
const migration=fs.readFileSync("lib/game/fastFood/migration.ts","utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const hero=page.slice(page.indexOf("function BusinessHero("),page.indexOf("function Calendar("));
const checks=[
 [pkg.version==="1.0.59","package version"],
 [page.includes('Pre-Alpha 1.0.59'),"visible version"],
 [data.includes('version:"1.0.59"'),"new game version"],
 [migration.includes('"1.0.58", "1.0.59"')&&migration.includes('version: "1.0.59"'),"migration support"],
 [pkg.scripts["verify:v1059"]==="node scripts/verify-v1059.mjs","verify script registered"],
 [hero.includes("businessHeroV59"),"new business overview card"],
 [!hero.includes("RestaurantVisual"),"restaurant artwork removed from overview"],
 [hero.includes("businessStatsV59")&&hero.includes("Opening progress"),"compact overview information"],
 [css.includes("Pre-Alpha 1.0.59")&&css.includes("businessHeroV59")&&css.includes("max-height:920px"),"responsive compact styling"],
];
for(const [ok,name] of checks){if(!ok)throw new Error(`Failed: ${name}`);console.log(`PASS ${name}`)}
