import type { FastFoodGame } from "./types";

export type OpeningRequirement = { id:string; label:string; complete:boolean; section:"Inventory"|"Employees"|"Menu"|"Equipment" };

export function hasCompleteMenuItem(game:FastFoodGame){
 return game.menu.some(item=>item.active&&Object.entries(item.ingredients).every(([id,use])=>use<=0||(game.inventory.find(i=>i.id===id)?.stock??0)>=use));
}
export function getOpeningRequirements(game:FastFoodGame):OpeningRequirement[]{
 const hasCashier=game.employees.some(e=>e.role==="Cashier");
 const hasKitchen=game.employees.some(e=>e.role==="Kitchen Crew"||e.role==="Cook");
 const equipmentReady=game.equipment.every(e=>e.condition>20);
 return [
  {id:"supplier",label:"Choose a supplier",complete:Boolean(game.selectedSupplierId),section:"Inventory"},
  {id:"inventory",label:"Receive enough stock for one sellable item",complete:hasCompleteMenuItem(game),section:"Inventory"},
  {id:"cashier",label:"Hire at least one cashier",complete:hasCashier,section:"Employees"},
  {id:"kitchen",label:"Hire at least one kitchen employee",complete:hasKitchen,section:"Employees"},
  {id:"menu",label:"Activate at least one menu item",complete:game.menu.some(i=>i.active),section:"Menu"},
  {id:"equipment",label:"Keep required equipment operational",complete:equipmentReady,section:"Equipment"},
 ];
}
export function canOpenRestaurant(game:FastFoodGame){return getOpeningRequirements(game).every(r=>r.complete)}
export function deriveOperationalStatus(game:FastFoodGame):FastFoodGame["operationalStatus"]{
 if(!game.founded)return "planning";
 if(game.operationalStatus==="renovating")return "renovating";
 if(game.operationalStatus==="closed"&&game.firstOpeningCompleted)return "closed";
 if(game.operationalStatus==="open"&&game.firstOpeningCompleted)return "open";
 return canOpenRestaurant(game)?"ready":"preparing";
}
