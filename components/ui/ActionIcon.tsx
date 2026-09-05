import GameIcon from "./GameIcon";import type { GameIconId } from "@/lib/ui/gameIcons";
export default function ActionIcon({icon}:{icon:GameIconId}){return <GameIcon icon={icon} size="medium" variant="card" decorative/>}
