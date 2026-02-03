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

/**
 * URL から game_id を取得（パスを '/' で分割し 'game' の次の要素）
 * transaction_game_info の key 組み立て用
 */
export function getGameIdFromUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "";
  const parts = url.split("/");
  const idx = parts.indexOf("game");
  if (idx === -1 || idx + 1 >= parts.length) return "";
  return parts[idx + 1] ?? "";
}

/**
 * transaction_game_info の key を組み立て
 * key: ${team}_${date}_${start_time}_${game_id}
 */
export function buildGameInfoKey(
  team: string,
  date: string,
  startTime: string,
  url: string
): string {
  const gameId = getGameIdFromUrl(url);
  return `${team}_${date}_${startTime}_${gameId}`;
}

/**
 * 投球回文字列（例: "5回1", "0回2/3"）を数値に変換
 * 「回」で分割し、1個目=整数部、2個目=端数（0/3→0, 1/3→0.33333, 2/3→0.66667 または 0,1,2）
 */
export function parseInnings(inning: string | null): number | null {
  if (!inning) return null;
  const parts = inning.split("回");
  const baseStr = parts[0] ?? "";
  const restStr = (parts[1] ?? "").trim();

  const base = Number(baseStr);
  if (Number.isNaN(base)) return null;

  if (restStr === "") return base;

  // "0/3", "1/3", "2/3" 形式（バックエンドの 06_get_pitcher_stats などと同様）
  if (restStr === "0/3") return base;
  if (restStr === "1/3") return base + 0.33333;
  if (restStr === "2/3") return base + 0.66667;

  const fracNum = Number(restStr);
  if (Number.isNaN(fracNum)) return base;

  if (fracNum === 0) return base;
  if (fracNum === 1) return base + 0.33333;
  if (fracNum === 2) return base + 0.66667;
  return base;
}
