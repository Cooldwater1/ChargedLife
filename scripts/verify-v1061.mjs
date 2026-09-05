import fs from "node:fs";

const page = fs.readFileSync("app/page.tsx", "utf8");
const css = fs.readFileSync("app/globals.css", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const data = fs.readFileSync("lib/game/fastFood/data.ts", "utf8");
const migration = fs.readFileSync("lib/game/fastFood/migration.ts", "utf8");
const dashboard = page.slice(page.indexOf("function Dashboard("), page.indexOf("function BusinessOverviewPage"));

const checks = [
  [pkg.version === "1.0.61", "package version"],
  [page.includes("Pre-Alpha 1.0.61"), "visible version"],
  [data.includes('version:"1.0.61"'), "new game version"],
  [migration.includes('"1.0.61"') && migration.includes('version: "1.0.61"'), "migration support"],
  [pkg.scripts["verify:v1061"] === "node scripts/verify-v1061.mjs", "verify script registered"],
  [!dashboard.includes("Recommended Actions"), "recommended actions removed from dashboard"],
  [!dashboard.includes("recommendations.map"), "recommended actions rendering removed"],
  [!page.includes("getRecommendedActions"), "recommended actions helper import removed"],
  [!fs.existsSync("lib/game/dashboard/recommendedActions.ts"), "unused recommendation helper removed"],
  [!css.includes("actionGridV56"), "unused recommendation styles removed"],
  [dashboard.includes("Business Portfolio") && dashboard.includes("Top Earning Businesses"), "core dashboard sections preserved"],
];

for (const [ok, name] of checks) {
  if (!ok) throw new Error(`Failed: ${name}`);
  console.log(`PASS ${name}`);
}
