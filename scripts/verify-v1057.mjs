import fs from "node:fs";

const page=fs.readFileSync("app/page.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const data=fs.readFileSync("lib/game/fastFood/data.ts","utf8");
const migration=fs.readFileSync("lib/game/fastFood/migration.ts","utf8");
const overview=page.slice(page.indexOf("function BusinessOverviewPage"),page.indexOf("const businessManagementTabs"));
const businessCenter=page.slice(page.indexOf("const businessManagementTabs"),page.indexOf("const restaurantTabs"));
const inventory=page.slice(page.indexOf("function InventoryPage"),page.indexOf("function EmployeesPage"));
const checks=[
 [pkg.version==="1.0.57","package version"],
 [page.includes('Pre-Alpha 1.0.57'),"visible version"],
 [data.includes('version:"1.0.57"'),"new game version"],
 [migration.includes('1.0.57'),"migration version"],
 [pkg.scripts["verify:v1057"]==="node scripts/verify-v1057.mjs","verify script registered"],
 [overview.includes("Total Revenue")&&overview.includes("Total Profit")&&overview.includes("Total Employees")&&overview.includes("Total Businesses"),"overview summary metrics"],
 [overview.includes("manageBusinessButtonV57")&&overview.includes("Manage"),"left manage action"],
 [businessCenter.includes("Inventory & Supplies")&&businessCenter.includes("Analytics & Reports")&&businessCenter.includes("BusinessManagementShell"),"per-business tabs"],
 [businessCenter.includes("RestaurantDashboard")&&businessCenter.includes("hideHeader"),"existing restaurant overview reused"],
 [inventory.includes("Current Inventory")&&inventory.includes("Choose Supplier")&&inventory.includes("Place Supply Order"),"improved inventory workflow"],
 [css.includes("businessOverviewMetricsV57")&&css.includes("businessManagementTabsV57")&&css.includes("inventoryWorkspaceV57"),"new interface styles"],
];
for(const [ok,name] of checks){if(!ok)throw new Error(`Failed: ${name}`);console.log(`PASS ${name}`)}
