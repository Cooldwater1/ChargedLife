import type { FastFoodGame, SupplierContract, SupplierLoyaltyLevel, SupplierProgress } from "./types";
export const quantityDiscount=(subtotal:number)=>subtotal>=10000?.10:subtotal>=5000?.08:subtotal>=2500?.06:subtotal>=1000?.03:0;
export const contractDiscount=(contract:SupplierContract)=>contract==="Exclusive"?.10:contract==="90-Day"?.06:contract==="30-Day"?.03:0;
export function loyaltyLevel(progress:SupplierProgress):SupplierLoyaltyLevel{
 if(progress.completedOrders>=35||progress.totalSpent>=150000)return "Strategic Partner";
 if(progress.completedOrders>=15||progress.totalSpent>=50000)return "Preferred Customer";
 if(progress.completedOrders>=5||progress.totalSpent>=10000)return "Regular Buyer";
 return "New Customer";
}
export function loyaltyDiscount(progress:SupplierProgress){const l=loyaltyLevel(progress);return l==="Strategic Partner"?.08:l==="Preferred Customer"?.05:l==="Regular Buyer"?.02:0}
export function supplierProgressFor(game:FastFoodGame,supplierId:string){return game.supplierProgress.find(p=>p.supplierId===supplierId)??{supplierId,completedOrders:0,totalSpent:0,contract:"None" as const,contractDaysRemaining:0}}
export function calculateOrderTotal(game:FastFoodGame,subtotal:number,express:boolean){
 const supplier=game.suppliers.find(s=>s.id===game.selectedSupplierId);if(!supplier)return null;
 const progress=supplierProgressFor(game,supplier.id);const q=quantityDiscount(subtotal),l=loyaltyDiscount(progress),c=contractDiscount(progress.contract);
 const priced=subtotal*supplier.price;const discount=priced*(q+l+c);const delivery=express?supplier.emergencyFee:0;return {supplier,progress,quantityRate:q,loyaltyRate:l,contractRate:c,basePriced:priced,discount,delivery,total:Math.max(0,Math.round(priced-discount+delivery))};
}
