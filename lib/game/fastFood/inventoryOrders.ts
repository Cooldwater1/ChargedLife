import type { FastFoodGame, PendingDelivery } from "./types";
import { calculateOrderTotal, supplierProgressFor } from "./supplierPricing";
export function recommendedOpeningQuantities(game:FastFoodGame){const ids=new Set<string>();game.menu.filter(i=>i.active).forEach(i=>Object.keys(i.ingredients).forEach(id=>ids.add(id)));return Object.fromEntries(game.inventory.map(i=>[i.id,ids.has(i.id)?Math.min(i.capacity,Math.max(i.reorder,Math.round(i.capacity*.35))):0]));}
export function placeInventoryOrder(game:FastFoodGame,quantities:Record<string,number>,express:boolean){
 if(!game.selectedSupplierId)return {game,error:"Choose a supplier before placing an order."};
 const items=game.inventory.map(i=>({inventoryId:i.id,quantity:Math.max(0,Math.min(i.capacity-i.stock,Math.floor(quantities[i.id]??0)))})).filter(i=>i.quantity>0);
 if(!items.length)return {game,error:"Add at least one item to the order."};
 const subtotal=items.reduce((sum,item)=>{const inv=game.inventory.find(i=>i.id===item.inventoryId)!;return sum+item.quantity*inv.unitCost},0);const pricing=calculateOrderTotal(game,subtotal,express);if(!pricing)return {game,error:"Choose a supplier before placing an order."};
 if(pricing.basePriced<pricing.supplier.minimum&&!express)return {game,error:`Minimum normal order is $${pricing.supplier.minimum.toLocaleString("en-US")}.`};
 if(pricing.total>game.companyCash)return {game,error:"The company does not have enough cash for this order."};
 const next=structuredClone(game);next.companyCash-=pricing.total;const sameDay=!next.firstStarterDeliveryUsed||express;const expectedDay=sameDay?next.day:next.day+pricing.supplier.delivery;const delivery:PendingDelivery={id:crypto.randomUUID(),supplierId:pricing.supplier.id,createdDay:next.day,expectedDay,express,subtotal:Math.round(subtotal),total:pricing.total,items};next.pendingDeliveries.push(delivery);next.firstStarterDeliveryUsed=true;
 if(sameDay)applyArrivedDeliveries(next,next.day);
 next.notifications.unshift({id:crypto.randomUUID(),text:sameDay?"Your supplier order has arrived.":`Supplier order placed for delivery on Day ${expectedDay}.`,section:"Inventory",read:false,severity:"success"});return {game:next,error:""};
}
export function applyArrivedDeliveries(game:FastFoodGame,day:number){
 const arrived=game.pendingDeliveries.filter(d=>d.expectedDay<=day);if(!arrived.length)return game;
 for(const d of arrived){for(const line of d.items){const inv=game.inventory.find(i=>i.id===line.inventoryId);if(inv)inv.stock=Math.min(inv.capacity,inv.stock+line.quantity)}const p=supplierProgressFor(game,d.supplierId);const existing=game.supplierProgress.find(x=>x.supplierId===d.supplierId);if(existing){existing.completedOrders+=1;existing.totalSpent+=d.total}else game.supplierProgress.push({...p,completedOrders:1,totalSpent:d.total});}
 game.pendingDeliveries=game.pendingDeliveries.filter(d=>d.expectedDay>day);return game;
}
