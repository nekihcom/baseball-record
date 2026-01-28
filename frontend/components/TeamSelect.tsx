import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDisplayTeamName as getDisplayTeamNameUtil } from "@/lib/utils";

interface TeamSelectProps {
  selectedTeam: string | null;
  onTeamChange: (team: string | null) => void;
  teamList: Array<{ key: string; name: string }>;
  showAllOption?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
}

/** チーム名から表示用の名前を抽出（括弧内があれば括弧内を優先） */
function getDisplayTeamName(teamName: string | null, teamKey: string | null): string {
  return getDisplayTeamNameUtil(teamName, teamKey);
}

export function TeamSelect({
  selectedTeam,
  onTeamChange,
  teamList,
  showAllOption = false,
  placeholder = "選択してください",
  label = "チーム",
  className = "",
}: TeamSelectProps) {
  const noneValue = showAllOption ? "all" : "none";
  const noneLabel = showAllOption ? "すべてのチーム" : "選択してください";

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <label className="text-base font-medium whitespace-nowrap">{label}</label>
      <Select
        value={selectedTeam || noneValue}
        onValueChange={(value) => {
          const newTeam = value === noneValue ? null : value;
          onTeamChange(newTeam);
        }}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={noneValue}>{noneLabel}</SelectItem>
          {teamList.map((team) => (
            <SelectItem key={team.key} value={team.key}>
              {getDisplayTeamName(team.name, team.key)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
