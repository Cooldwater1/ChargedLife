export type GameIconId =
  | "dashboard" | "overview" | "restaurants" | "locationsExpansion"
  | "menuPricing" | "inventorySuppliers" | "employees" | "equipment"
  | "marketingCustomers" | "upgrades" | "finances" | "settings" | "gameGuide"
  | "personalCash" | "companyCash" | "netWorth" | "companyValue"
  | "revenue" | "expenses" | "profit" | "customers" | "reputation"
  | "brand" | "delivery" | "loyalty" | "reliability" | "discount"
  | "calendar" | "notifications" | "reports";

export const gameIconLabels:Record<GameIconId,string>={
 dashboard:"Dashboard",overview:"Overview",restaurants:"Businesses",locationsExpansion:"Locations and expansion",menuPricing:"Menu and pricing",inventorySuppliers:"Inventory and suppliers",employees:"Employees",equipment:"Equipment",marketingCustomers:"Marketing and customers",upgrades:"Upgrades",finances:"Finances",settings:"Settings",gameGuide:"Game guide",personalCash:"Personal cash",companyCash:"Company cash",netWorth:"Net worth",companyValue:"Company value",revenue:"Revenue",expenses:"Expenses",profit:"Profit",customers:"Customers",reputation:"Reputation",brand:"Brand and exterior",delivery:"Delivery",loyalty:"Loyalty",reliability:"Reliability",discount:"Discount",calendar:"Calendar",notifications:"Notifications",reports:"Reports"
};
