import fs from "node:fs";

const page=fs.readFileSync("app/page.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const data=fs.readFileSync("lib/game/fastFood/data.ts","utf8");
const migration=fs.readFileSync("lib/game/fastFood/migration.ts","utf8");
const selectors=fs.readFileSync("lib/game/dashboard/dashboardSelectors.ts","utf8");
const summaries=fs.readFileSync("lib/game/empireSummary.ts","utf8");
const overview=page.slice(page.indexOf("function BusinessOverviewPage"),page.indexOf("const businessManagementTabs"));
const checks=[
 [pkg.version==="1.0.58","package version"],
 [page.includes('Pre-Alpha 1.0.58'),"visible version"],
 [data.includes('version:"1.0.58"'),"new game version"],
 [migration.includes('version: "1.0.58"')&&migration.includes('"1.0.58"'),"migration support"],
 [pkg.scripts["verify:v1058"]==="node scripts/verify-v1058.mjs","verify script registered"],
 [overview.includes('className="businessIdentityV57"><b>')&&!overview.includes('businessIdentityV57"><i>'),"business initials tile removed"],
 [summaries.includes("getBusinessDisplayName")&&selectors.includes("getBusinessDisplayName"),"central business-name fallback"],
 [page.includes("businessName:companyName"),"new company name used as business name"],
 [css.includes("Pre-Alpha 1.0.58")&&css.includes("font-size:16px")&&css.includes("min-height:72px"),"larger business-list styling"],
];
for(const [ok,name] of checks){if(!ok)throw new Error(`Failed: ${name}`);console.log(`PASS ${name}`)}
