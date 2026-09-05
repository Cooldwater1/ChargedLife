import fs from "node:fs";
import path from "node:path";

const page=fs.readFileSync("app/page.tsx","utf8");
const css=fs.readFileSync("app/globals.css","utf8");
const types=fs.readFileSync("lib/game/fastFood/types.ts","utf8");
const data=fs.readFileSync("lib/game/fastFood/data.ts","utf8");
const migration=fs.readFileSync("lib/game/fastFood/migration.ts","utf8");
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));
const dashboard=page.slice(page.indexOf("function Dashboard("),page.indexOf("function EmpireOverview"));
const publicBytes=(directory)=>fs.readdirSync(directory,{withFileTypes:true}).reduce((sum,item)=>{
  const target=path.join(directory,item.name);
  return sum+(item.isDirectory()?publicBytes(target):fs.statSync(target).size);
},0);
const checks=[
 [pkg.version==="1.0.55","package version"],
 [page.includes('Pre-Alpha 1.0.55'),"visible version"],
 [page.includes("function CompanySetup"),"company onboarding"],
 [page.includes("Create your company"),"company setup copy"],
 [page.includes("Fast Food")&&page.includes("AVAILABLE NOW"),"industry selection"],
 [types.includes("companyName:string")&&types.includes("companyCreated:boolean"),"company save fields"],
 [data.includes('companyCreated:false'),"new-game company state"],
 [migration.includes('version:\"1.0.55\"')&&migration.includes("companyCreated"),"migration support"],
 [dashboard.includes("simpleDashboardV55"),"simplified dashboard"],
 [!dashboard.includes("<RestaurantVisual"),"dashboard has no restaurant artwork"],
 [css.includes("simpleDashboardV55"),"dashboard styles"],
 [!fs.existsSync("public/images/ui-icons"),"unused icon source removed"],
 [!fs.existsSync("app/legacy-page-v1029.tsx"),"legacy page removed"],
 [publicBytes("public")<45*1024*1024,"public assets reduced"],
 [pkg.scripts["verify:v1055"]==="node scripts/verify-v1055.mjs","verify script registered"],
];
for(const [ok,name] of checks){if(!ok)throw new Error(`Failed: ${name}`);console.log(`PASS ${name}`)}
