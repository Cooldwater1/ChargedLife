import type { FastFoodGame, NavSection } from "@/lib/game/fastFood/types";
import { deriveOperationalStatus } from "@/lib/game/fastFood/openingRequirements";

export type BusinessHealthTone = "excellent" | "stable" | "attention" | "critical";
export type BusinessHealthItem = {
 id:string;
 label:string;
 state:string;
 tone:BusinessHealthTone;
 detail:string;
 targetSection:NavSection;
};
export type ManagementPriority = {
 id:string;
 title:string;
 reason:string;
 impact:string;
 tone:"critical"|"warning"|"info";
 targetSection:NavSection;
 action:string;
};

export function getBusinessTrend(game:FastFoodGame){
 const reports=(Array.isArray(game.reports)?game.reports:[]).slice(0,7).reverse();
 return {
  hasHistory:reports.length>=2,
  labels:reports.map(report=>`Day ${report.day}`),
  revenue:reports.map(report=>report.revenue),
  expenses:reports.map(report=>report.expenses),
  profit:reports.map(report=>report.profit),
 };
}

export function getBusinessHealth(game:FastFoodGame):BusinessHealthItem[]{
 const latest=Array.isArray(game.reports)?game.reports[0]:undefined;
 const status=deriveOperationalStatus(game);
 const lowStock=game.inventory.filter(item=>item.stock<=item.reorder).length;
 const activeMenu=game.menu.filter(item=>item.active).length;
 const staffingTarget=Math.max(2,Math.ceil(game.capacity/40));
 const staffingRatio=game.employees.length/staffingTarget;
 const inventoryReady=game.inventory.some(item=>item.stock>item.reorder);
 const reputationReady=game.reviews>0;
 const expansionReady=game.companyCash>=50000&&game.companyValue>=75000&&game.reputation>=4&&status==="open";
 return [
  {
   id:"finance",label:"Financial health",
   state:!latest?"No completed day":latest.profit>0?"Profitable":latest.profit===0?"Break-even":"Operating at a loss",
   tone:!latest?"attention":latest.profit>0?"excellent":latest.profit===0?"stable":latest.profit<-5000?"critical":"attention",
   detail:!latest?"Complete a business day to establish a financial baseline.":`${latest.profit>=0?"Earned":"Lost"} $${Math.abs(Math.round(latest.profit)).toLocaleString("en-US")} on the latest day.`,
   targetSection:"Finances",
  },
  {
   id:"staffing",label:"Staffing",
   state:staffingRatio>=1?"Stable":game.employees.length>=2?"Under capacity":"Critical shortage",
   tone:staffingRatio>=1?"excellent":game.employees.length>=2?"attention":"critical",
   detail:`${game.employees.length} employees for an estimated ${staffingTarget}-employee operating target.`,
   targetSection:"Employees",
  },
  {
   id:"inventory",label:"Inventory",
   state:status!=="open"&&!inventoryReady?"Opening stock missing":lowStock===0?"Stable":lowStock<=3?"Needs attention":"Critical",
   tone:status!=="open"&&!inventoryReady?"attention":lowStock===0?"excellent":lowStock<=3?"attention":"critical",
   detail:status!=="open"&&!inventoryReady?"Order the first opening stock before operating.":lowStock?`${lowStock} item${lowStock===1?"":"s"} at or below reorder level.`:"All tracked items are above reorder level.",
   targetSection:"Inventory",
  },
  {
   id:"reputation",label:"Customer reputation",
   state:!reputationReady?"No reviews":game.reputation>=4.5?"Excellent":game.reputation>=4?"Good":game.reputation>=3?"Needs attention":"Critical",
   tone:!reputationReady?"attention":game.reputation>=4.5?"excellent":game.reputation>=4?"stable":game.reputation>=3?"attention":"critical",
   detail:!reputationReady?"Serve customers to establish a public reputation.":`${game.reputation.toFixed(1)} / 5 from ${game.reviews} review${game.reviews===1?"":"s"}.`,
   targetSection:"Marketing",
  },
  {
   id:"expansion",label:"Expansion readiness",
   state:expansionReady?"Ready":status!=="open"?"Not operational":activeMenu<3?"Menu too limited":"Not ready",
   tone:expansionReady?"excellent":status!=="open"?"critical":"attention",
   detail:expansionReady?"The company meets the current baseline for another location.":"Build stable operations, cash, value and reputation before expanding.",
   targetSection:"Locations",
  },
 ];
}

export function getManagementPriorities(game:FastFoodGame):ManagementPriority[]{
 const latest=Array.isArray(game.reports)?game.reports[0]:undefined;
 const status=deriveOperationalStatus(game);
 const lowStock=game.inventory.filter(item=>item.stock<=item.reorder).length;
 const priorities:ManagementPriority[]=[];
 if(status!=="open") priorities.push({id:"opening",title:"Complete the opening setup",reason:"The main location is not fully operational yet.",impact:"Unlock normal customer service and daily revenue.",tone:"critical",targetSection:"Restaurant Overview",action:"Continue Setup"});
 if(latest&&latest.profit<0) priorities.push({id:"profit",title:"Reduce operating losses",reason:`The latest business day lost $${Math.abs(Math.round(latest.profit)).toLocaleString("en-US")}.`,impact:"Improve margins and protect company cash.",tone:latest.profit<-5000?"critical":"warning",targetSection:"Finances",action:"Review Finances"});
 if(lowStock>0&&status==="open") priorities.push({id:"stock",title:"Restore inventory coverage",reason:`${lowStock} ingredient or supply line${lowStock===1?" is":"s are"} at reorder level.`,impact:"Prevent unavailable menu items and lost sales.",tone:lowStock>5?"critical":"warning",targetSection:"Inventory",action:"Order Supplies"});
 const staffingTarget=Math.max(2,Math.ceil(game.capacity/40));
 if(game.employees.length<staffingTarget) priorities.push({id:"staffing",title:"Improve staffing coverage",reason:`You have ${game.employees.length} of roughly ${staffingTarget} recommended employees.`,impact:"Reduce wait times and recover customer capacity.",tone:game.employees.length<2?"critical":"warning",targetSection:"Employees",action:"Review Employees"});
 if(game.reviews===0) priorities.push({id:"reputation",title:"Establish customer reputation",reason:"The company has no customer reviews yet.",impact:"Build trust and improve future expansion readiness.",tone:"info",targetSection:"Marketing",action:"Review Marketing"});
 if(priorities.length<3) priorities.push({id:"growth",title:"Prepare the next growth step",reason:"Operations are stable enough to review future capacity.",impact:"Plan equipment, branding or location expansion.",tone:"info",targetSection:"Research",action:"Review Upgrades"});
 return priorities.slice(0,3);
}
