import GameIcon from "./GameIcon";import type { GameIconId } from "@/lib/ui/gameIcons";
export default function NavigationIcon({icon}:{icon:GameIconId}){return <GameIcon icon={icon} size="small" variant="navigation" decorative/>}
