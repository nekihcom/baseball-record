import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** チーム名から表示用の名前を抽出（括弧内があれば括弧内を優先） */
export function getDisplayTeamName(teamName: string | null, teamKey: string | null): string {
  if (!teamName && !teamKey) return "—";
  
  const name = teamName || teamKey || "";
  
  // 括弧内のテキストを抽出（例：「スワローズファン友の会(スワ友)」→「スワ友」）
  const match = name.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }
  
  // 括弧がない場合はそのまま大文字で返す
  return name.toUpperCase();
}
