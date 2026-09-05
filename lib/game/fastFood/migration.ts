import { newGame, suppliers } from "./data";
import { defaultBuildingForConcept, defaultLogoForConcept } from "./restaurantAssets";
import type { FastFoodGame, LegacyBusiness } from "./types";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord => value && typeof value === "object" ? value as UnknownRecord : {};
const asNumber = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
const asString = (value: unknown, fallback: string) => typeof value === "string" ? value : fallback;
const genericBusinessNames = new Set(["fast food group", "fast food business", "your business"]);

const versions = [
  "1.0.30", "1.0.31", "1.0.32", "1.0.33", "1.0.34", "1.0.35", "1.0.36", "1.0.37",
  "1.0.38", "1.0.39", "1.0.40", "1.0.41", "1.0.42", "1.0.43", "1.0.44", "1.0.45",
  "1.0.46", "1.0.47", "1.0.48", "1.0.49", "1.0.50", "1.0.51", "1.0.52", "1.0.53",
  "1.0.54", "1.0.55", "1.0.56", "1.0.57", "1.0.58", "1.0.61",
];

function normalizeBusinessName(rawBusinessName: string, companyName: string, restaurantName: string, fallback: string) {
  const trimmed = rawBusinessName.trim();
  if (trimmed && !genericBusinessNames.has(trimmed.toLowerCase())) return trimmed;
  return companyName.trim() || restaurantName.trim() || fallback;
}

export function loadAndMigrate(raw: string | null): FastFoodGame {
  const fresh = newGame();
  if (!raw) return fresh;

  try {
    const parsed: unknown = JSON.parse(raw);
    const old = asRecord(parsed);

    if (versions.includes(String(old.version)) && Array.isArray(old.menu) && Array.isArray(old.inventory)) {
      const concept = asString(old.concept, fresh.concept);
      const prior = old as unknown as FastFoodGame;
      const hadOperations =
        (Array.isArray(old.reports) && old.reports.length > 0) ||
        (Array.isArray(old.inventory) && old.inventory.some((item) => asNumber(asRecord(item).stock, 0) > 0));
      const selected = asString(old.selectedSupplierId, hadOperations ? "standard" : "");
      const supplierProgress = Array.isArray(old.supplierProgress)
        ? old.supplierProgress as FastFoodGame["supplierProgress"]
        : suppliers.map((supplier) => ({
          supplierId: supplier.id,
          completedOrders: 0,
          totalSpent: 0,
          contract: "None" as const,
          contractDaysRemaining: 0,
        }));
      const restaurantName = asString(old.restaurantName, fresh.restaurantName);
      const companyName = asString(old.companyName, asString(old.businessName, "ChargedLife Company"));
      const rawBusinessName = asString(old.businessName, restaurantName ? `${restaurantName} Group` : fresh.businessName);
      const businessName = normalizeBusinessName(rawBusinessName, companyName, restaurantName, fresh.businessName);
      const settings = { ...fresh.settings, ...(asRecord(old.settings) as Partial<FastFoodGame["settings"]>) };

      return {
        ...fresh,
        ...prior,
        version: "1.0.61",
        companyName,
        companyCreated: old.companyCreated === undefined ? true : Boolean(old.companyCreated),
        selectedIndustry: asString(old.selectedIndustry, "fast-food") as FastFoodGame["selectedIndustry"],
        businessId: asString(old.businessId, fresh.businessId),
        locationId: asString(old.locationId, fresh.locationId),
        businessName,
        selectedBusinessId: asString(old.selectedBusinessId, fresh.businessId),
        selectedLocationId: asString(old.selectedLocationId, fresh.locationId),
        additionalTestLocations: asNumber(old.additionalTestLocations, 0),
        settings,
        loans: Array.isArray(old.loans) ? old.loans as FastFoodGame["loans"] : [],
        suppliers: structuredClone(suppliers),
        selectedSupplierId: selected,
        supplierProgress,
        pendingDeliveries: Array.isArray(old.pendingDeliveries) ? old.pendingDeliveries as FastFoodGame["pendingDeliveries"] : [],
        firstStarterDeliveryUsed: Boolean(old.firstStarterDeliveryUsed) || hadOperations,
        operationalStatus: asString(old.operationalStatus, hadOperations ? "open" : "preparing") as FastFoodGame["operationalStatus"],
        ownerWorksNextShift: Boolean(old.ownerWorksNextShift),
        founderFatigue: asNumber(old.founderFatigue, 0),
        firstOpeningCompleted: old.firstOpeningCompleted === undefined ? hadOperations : Boolean(old.firstOpeningCompleted),
        restaurantOpenedDay: typeof old.restaurantOpenedDay === "number" ? old.restaurantOpenedDay : hadOperations ? 1 : null,
        buildingAssetId: asString(old.buildingAssetId, defaultBuildingForConcept(concept)),
        logoAssetId: asString(old.logoAssetId, defaultLogoForConcept(concept)),
        primaryColor: asString(old.primaryColor, asString(old.themeColor, "#ff9f1c")),
        secondaryColor: asString(old.secondaryColor, "#111827"),
        signStyle: "integrated",
        signPlacementVersion: 2,
        signContentMode: "integrated",
        showSignLogo: old.showSignLogo === undefined ? true : Boolean(old.showSignLogo),
        sloganVisibilityMode: asString(old.sloganVisibilityMode, "auto") as FastFoodGame["sloganVisibilityMode"],
        visualStage: asString(old.visualStage, "starter") as FastFoodGame["visualStage"],
        hasDriveThrough: Boolean(old.hasDriveThrough),
        appearanceUpgradeHistory: Array.isArray(old.appearanceUpgradeHistory) ? old.appearanceUpgradeHistory as string[] : [],
        renameUsed: Boolean(old.renameUsed),
        recentReviews: Array.isArray(old.recentReviews) ? old.recentReviews as FastFoodGame["recentReviews"] : [],
        founded: old.founded !== false,
      };
    }

    const businesses = Array.isArray(old.businesses) ? old.businesses : [];
    const legacy: LegacyBusiness[] = businesses
      .map(asRecord)
      .filter((business) => !asString(business.typeName ?? business.typeId, "").toLowerCase().includes("fast"))
      .map((business) => ({
        id: asString(business.id, crypto.randomUUID()),
        name: asString(business.name, "Legacy Business"),
        typeName: asString(business.typeName, "Legacy Business"),
        value: asNumber(business.value, 0),
        businessCash: asNumber(business.businessCash, 0),
      }));
    const concept = asString(old.concept, fresh.concept);
    const companyName = asString(old.companyName, asString(old.businessName, "ChargedLife Company"));

    return {
      ...fresh,
      version: "1.0.61",
      companyName,
      companyCreated: true,
      selectedIndustry: "fast-food",
      businessName: companyName,
      founderName: asString(old.playerName ?? old.founderName, fresh.founderName),
      personalCash: asNumber(old.cash ?? old.personalCash, fresh.personalCash),
      companyValue: asNumber(old.netWorth ?? old.companyValue, fresh.companyValue),
      day: asNumber(old.day, fresh.day),
      month: asNumber(old.month, fresh.month),
      legacyBusinesses: legacy,
      founded: true,
      concept,
      operationalStatus: "open",
      firstOpeningCompleted: true,
      restaurantOpenedDay: 1,
      selectedSupplierId: "standard",
      buildingAssetId: defaultBuildingForConcept(concept),
      logoAssetId: defaultLogoForConcept(concept),
      notifications: [
        {
          id: "migration",
          text: `Save migrated safely. ${legacy.length} older businesses are available in Legacy Portfolio.`,
          section: "Businesses",
          read: false,
          severity: "info",
        },
        ...fresh.notifications,
      ],
    };
  } catch {
    return fresh;
  }
}
