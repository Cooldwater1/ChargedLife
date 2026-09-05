"use client";
import type { GameIconId } from "@/lib/ui/gameIcons";
import { gameIconLabels } from "@/lib/ui/gameIcons";

type Props={icon:GameIconId;size?:"small"|"medium"|"large";decorative?:boolean;className?:string;variant?:"navigation"|"card"|"full"};
const dimensions={small:20,medium:28,large:56};
const paths:Record<GameIconId,React.ReactNode>={
 dashboard:<><rect x="3" y="4" width="18" height="15" rx="2"/><path d="M7 15v-4m5 4V8m5 7v-7"/></>,
 overview:<><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></>,
 restaurants:<><path d="M4 10h16v10H4zM3 10l2-5h14l2 5M8 20v-6h4v6"/><path d="M7 5v5m5-5v5m5-5v5"/></>,
 locationsExpansion:<><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11z"/><circle cx="12" cy="10" r="2"/><path d="M16 17h5m-2-2 2 2-2 2"/></>,
 menuPricing:<><path d="M5 4h10v16H5zM8 8h4M8 12h4"/><path d="M15 9l5 5-5 5-3-3 3-7z"/></>,
 inventorySuppliers:<><path d="M4 8l8-4 8 4v9l-8 4-8-4zM4 8l8 4 8-4M12 12v9"/><path d="M17 15h5m-2-2 2 2-2 2"/></>,
 employees:<><circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2.5"/><path d="M3 20c.5-4 3-6 6-6s5.5 2 6 6M13 15c3 0 5 1.8 5.5 5"/></>,
 equipment:<><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/></>,
 marketingCustomers:<><path d="M4 13V9l10-4v12L4 13zM14 9h3a3 3 0 0 1 0 6h-3M6 14l1 6h4l-1-5"/></>,
 upgrades:<><path d="M12 21V6m0 0-5 5m5-5 5 5"/><path d="M5 20h14"/></>,
 finances:<><path d="M4 19V9m5 10V5m5 14v-7m5 7V3"/><path d="M3 19h18"/></>,
 settings:<><circle cx="12" cy="12" r="3"/><path d="M12 2.75v2.1M12 19.15v2.1M2.75 12h2.1M19.15 12h2.1M5.46 5.46l1.49 1.49M17.05 17.05l1.49 1.49M18.54 5.46l-1.49 1.49M6.95 17.05l-1.49 1.49"/><path d="M8.15 4.15 9 6.05m6 11.9.85 1.9M4.15 15.85 6.05 15m11.9-6 .9-1.85M4.15 8.15 6.05 9m11.9 6 .9.85M8.15 19.85 9 17.95m6-11.9.85-1.9"/></>,
 gameGuide:<><path d="M4 5c3-1 5-.5 8 1v14c-3-1.5-5-2-8-1zM20 5c-3-1-5-.5-8 1v14c3-1.5 5-2 8-1z"/></>,
 personalCash:<><rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M7 9h1m8 6h1"/></>,
 companyCash:<><path d="M4 9h16v10H4zM7 9V6h10v3"/><circle cx="12" cy="14" r="2"/></>,
 netWorth:<><path d="M4 18l5-5 4 3 7-8"/><path d="M15 8h5v5"/></>,
 companyValue:<><path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M8 13h8M10 10h4m-4 6h4"/></>,
 revenue:<><path d="M4 18l5-5 4 3 7-8"/><path d="M15 8h5v5"/></>,
 expenses:<><path d="M4 6l5 5 4-3 7 8"/><path d="M15 16h5v-5"/></>,
 profit:<><path d="M4 18l5-5 4 3 7-8"/><path d="M15 8h5v5"/></>,
 customers:<><circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2 20c.5-4 3-6 6-6s5.5 2 6 6M10 20c.5-4 3-6 6-6s5.5 2 6 6"/></>,
 reputation:<><path d="m12 3 2.7 5.5 6 .9-4.3 4.2 1 5.9-5.4-2.8-5.4 2.8 1-5.9-4.3-4.2 6-.9z"/></>,
 brand:<><path d="M4 5h16v14H4zM7 8h10M8 12h8M9 16h6"/></>,
 delivery:<><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
 loyalty:<><path d="M12 21s-7-4.2-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.8-7 10-7 10z"/></>,
 reliability:<><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="m8 12 2.5 2.5L16 9"/></>,
 discount:<><circle cx="8" cy="8" r="2"/><circle cx="16" cy="16" r="2"/><path d="M7 17 17 7"/></>,
 calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></>,
 notifications:<><path d="M6 17h12l-2-3V9a4 4 0 0 0-8 0v5z"/><path d="M10 20h4"/></>,
 reports:<><path d="M5 3h11l3 3v15H5zM16 3v4h4M8 11h8M8 15h8"/></>,
};
export default function GameIcon({icon,size="medium",decorative=false,className=""}:Props){const px=dimensions[size];return <span className={`gameIcon gameIcon-${size} ${className}`} style={{width:px,height:px}} aria-hidden={decorative||undefined}><svg viewBox="0 0 24 24" role={decorative?undefined:"img"} aria-label={decorative?undefined:gameIconLabels[icon]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[icon]}</svg></span>}
