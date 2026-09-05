import fs from "node:fs";

const page=fs.readFileSync("app/page.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const data=fs.readFileSync("lib/game/fastFood/data.ts","utf8");
const migration=fs.readFileSync("lib/game/fastFood/migration.ts","utf8");
const dashboard=page.slice(page.indexOf("function RestaurantDashboard("),page.indexOf("function StatusBadge"));
const checks=[
 [pkg.version==="1.0.60","package version"],
 [page.includes('Pre-Alpha 1.0.60'),"visible version"],
 [data.includes('version:"1.0.60"'),"new game version"],
 [migration.includes('1.0.60')&&migration.includes('version: "1.0.60"'),"migration support"],
 [pkg.scripts["verify:v1060"]==="node scripts/verify-v1060.mjs","verify script registered"],
 [dashboard.includes('restaurantMetricsV60'),"restaurant metric layout"],
 [dashboard.includes('showHelper={false}'),"metric helper text removed"],
 [dashboard.includes('reputationV60')&&!dashboard.includes('repHead'),"reputation card rebuilt"],
 [!dashboard.includes('<Quick'),"quick actions removed"],
 [!page.includes('function Quick('),"unused quick action component removed"],
 [!fs.existsSync('components/ui/ActionIcon.tsx'),"unused action icon component removed"],
 [css.includes('Pre-Alpha 1.0.60')&&css.includes('reputationMainV60'),"new styles present"],
];
for(const [ok,name] of checks){if(!ok)throw new Error(`Failed: ${name}`);console.log(`PASS ${name}`)}
