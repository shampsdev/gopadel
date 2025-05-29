import { PlayingPosition } from "@/types/user"

export function getPlayingPositionText(position: PlayingPosition | null | undefined): string {
  if (!position) return "Не указано"
  
  switch (position) {
    case "right":
      return "В правом"
    case "left":
      return "В левом"
    case "both":
      return "В обоих"
    default:
      return "Не указано"
  }
} 