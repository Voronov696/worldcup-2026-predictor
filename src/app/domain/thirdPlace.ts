import type { GroupStanding, Team } from './types';

export function selectBestThirdPlaced(
  allGroupStandings: GroupStanding[][],
  teams: Team[]
): GroupStanding[] {
  const fifaRank = new Map(teams.map(t => [t.id, t.fifaRanking]));

  return allGroupStandings
    .map(standings => standings[2])
    .sort((a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      fifaRank.get(a.teamId)! - fifaRank.get(b.teamId)!
    )
    .slice(0, 8);
}
