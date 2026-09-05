export type NavSection = "Dashboard" | "Overview" | "Businesses" | "Business Center" | "Restaurant Overview" | "Brand & Exterior" | "Locations" | "Menu" | "Pricing" | "Inventory" | "Employees" | "Suppliers" | "Equipment" | "Marketing" | "Customers" | "Expansion" | "Research" | "Finances" | "Loans" | "Reports" | "Goals" | "Achievements" | "Settings" | "Game Guide";

export type GameSettings = {
 confirmNextDay:boolean; autoOpenDailyReport:boolean; pauseOnCriticalIssue:boolean; detailedSimulation:boolean; tutorialHints:boolean; showOpeningChecklist:boolean; reportDensity:"compact"|"detailed";
 uiScale:"compact"|"normal"|"large"; sidebarMode:"expanded"|"compact"; graphAnimation:boolean; reduceEffects:boolean; showHelperText:boolean; numberFormat:"standard"|"compact"; currency:"USD";
 largerText:boolean; highContrast:boolean; reduceMotion:boolean; colorBlindIndicators:boolean; strongFocus:boolean; testingToolsEnabled:boolean;
};
export type BusinessIndustry = "fast-food" | "retail" | "software" | "real-estate" | "logistics" | "entertainment" | "hospitality";
export type EmpireSummary = { totalRevenue:number; totalExpenses:number; totalProfit:number; totalEmployees:number; totalBusinesses:number; totalLocations:number; averageReputation:number; totalBusinessValue:number; };
export type OwnerPayoutPolicy = "None" | "Conservative" | "Balanced" | "High";
export type EmployeeRole = "Cashier" | "Kitchen Crew" | "Cook" | "Shift Supervisor" | "Cleaner" | "Assistant Manager" | "Restaurant Manager";
export type RestaurantOperationalStatus = "planning" | "preparing" | "ready" | "open" | "closed" | "renovating";
export type SupplierContract = "None" | "30-Day" | "90-Day" | "Exclusive";
export type SupplierLoyaltyLevel = "New Customer" | "Regular Buyer" | "Preferred Customer" | "Strategic Partner";
export type MenuItem = { id:string; name:string; icon:string; price:number; cost:number; popularity:number; rating:number; prep:number; active:boolean; featured:boolean; sales:number; ingredients:Record<string,number> };
export type InventoryItem = { id:string; name:string; stock:number; capacity:number; reorder:number; unitCost:number; quality:number; spoilage:number; autoReorder:boolean; unit:string };
export type Employee = { id:string; name:string; role:EmployeeRole; skill:number; speed:number; reliability:number; mood:number; fatigue:number; wage:number; experience:number; training:number; shift:string; performance:number };
export type Equipment = { id:string; name:string; condition:number; capacity:number; speed:number; maintenanceCost:number; level:number; breakdownRisk:number };
export type Supplier = { id:string; name:string; price:number; quality:number; reliability:number; delivery:number; minimum:number; description:string; lateRisk:number; emergencyFee:number; categories:string[]; reputationImpact:number };
export type SupplierProgress = { supplierId:string; completedOrders:number; totalSpent:number; contract:SupplierContract; contractDaysRemaining:number };
export type PendingDelivery = { id:string; supplierId:string; createdDay:number; expectedDay:number; express:boolean; subtotal:number; total:number; items:{inventoryId:string;quantity:number}[] };
export type DailyReport = { day:number; headline:string; operationalStatus:RestaurantOperationalStatus; customersAttempted:number; customersServed:number; customersLost:number; revenue:number; foodCost:number; wages:number; rent:number; marketing:number; maintenance:number; waste:number; expenses:number; profit:number; bestItem:string; waitTime:number; satisfaction:number; reputationChange:number; valueChange:number; notes:string[] };
export type MonthlyReport = { month:number; days:number; revenue:number; expenses:number; profit:number; customers:number; bestItem:string; worstItem:string; averageReview:number; waste:number; equipmentCosts:number; valueChange:number; events:string[] };
export type Loan = { id:string; name:string; balance:number };
export type LegacyBusiness = { id:string; name:string; typeName:string; value:number; businessCash:number };
export type CustomerReview = { id:string; name:string; rating:number; text:string; day:number };
export type FastFoodGame = {
 version:string; founderName:string; companyName:string; companyCreated:boolean; selectedIndustry:BusinessIndustry; businessId:string; locationId:string; businessName:string; selectedBusinessId:string; selectedLocationId:string; additionalTestLocations:number; settings:GameSettings; founderLevel:number; personalCash:number; companyCash:number; companyValue:number; day:number; month:number; weekday:number;
 restaurantName:string; slogan:string; concept:string; location:string; themeColor:string; buildingAssetId:string; logoAssetId:string; primaryColor:string; secondaryColor:string; signStyle:string; signPlacementVersion:number; signContentMode:"integrated"; showSignLogo:boolean; sloganVisibilityMode:"auto"|"show"|"hide"; visualStage:"starter"|"established"|"drive-through"|"premium"|"flagship"; hasDriveThrough:boolean; appearanceUpgradeHistory:string[]; renameUsed:boolean;
 operationalStatus:RestaurantOperationalStatus; ownerWorksNextShift:boolean; founderFatigue:number; firstOpeningCompleted:boolean; restaurantOpenedDay:number|null;
 reputation:number; reviews:number; restaurantLevel:number; restaurantXp:number; restaurantValue:number; capacity:number; rentDaily:number; marketingDays:number;
 selectedSupplierId:string; supplierProgress:SupplierProgress[]; pendingDeliveries:PendingDelivery[]; firstStarterDeliveryUsed:boolean;
 payoutPolicy:OwnerPayoutPolicy; loans:Loan[]; menu:MenuItem[]; inventory:InventoryItem[]; employees:Employee[]; equipment:Equipment[]; suppliers:Supplier[]; reports:DailyReport[]; monthlyReports:MonthlyReport[];
 notifications:{id:string;text:string;section:NavSection;read:boolean;severity:"info"|"warning"|"success"}[]; recentReviews:CustomerReview[]; legacyBusinesses:LegacyBusiness[]; founded:boolean;
};
