import type { EmpireSummary, FastFoodGame } from "@/lib/game/fastFood/types";

const GENERIC_BUSINESS_NAMES=new Set(["fast food group","fast food business","your business"]);

export function getBusinessDisplayName(game:FastFoodGame){
 const businessName=(game.businessName||"").trim();
 const companyName=(game.companyName||"").trim();
 const restaurantName=(game.restaurantName||"").trim();
 if(businessName&&!GENERIC_BUSINESS_NAMES.has(businessName.toLowerCase()))return businessName;
 return companyName||restaurantName||businessName||"Fast Food Business";
}

export function getEmpireSummary(game:FastFoodGame):EmpireSummary{
 const latest=game.reports[0];
 return {
  totalRevenue:latest?.revenue??0,
  totalExpenses:latest?.expenses??0,
  totalProfit:latest?.profit??0,
  totalEmployees:game.employees.length,
  totalBusinesses:game.founded?1:0,
  totalLocations:game.founded?1+game.additionalTestLocations:0,
  averageReputation:game.reviews>0?game.reputation:0,
  totalBusinessValue:game.companyValue,
 };
}

export function getBusinessSummary(game:FastFoodGame){
 const empire=getEmpireSummary(game);
 return {id:game.businessId,name:getBusinessDisplayName(game),industry:"Fast Food",cash:game.companyCash,value:game.companyValue,reputation:game.reputation,locations:empire.totalLocations,employees:game.employees.length,revenue:empire.totalRevenue,profit:empire.totalProfit,status:game.founded?"active":"planning" as const};
}

export function getLocationSummary(game:FastFoodGame){
 const latest=game.reports[0];
 return {id:game.locationId,name:game.restaurantName||"Your Restaurant",location:game.location,status:game.operationalStatus,employees:game.employees.length,revenue:latest?.revenue??0,profit:latest?.profit??0,customers:latest?.customersServed??0,reputation:game.reputation,value:game.restaurantValue};
}
