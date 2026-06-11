import type { GroupId, GroupMatch, Team } from './types';

export const GROUP_IDS: GroupId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

// Fixed round-robin schedule for 4 teams (positions 0–3 within each group).
// Pair order implies matchdays: matches 1-2 = MD1, 3-4 = MD2, 5-6 = MD3.
const ROUND_ROBIN_PAIRS: [number, number][] = [
  [0, 1], [2, 3],
  [0, 2], [1, 3],
  [0, 3], [1, 2],
];

export function generateGroupFixtures(teams: Team[]): GroupMatch[] {
  const matches: GroupMatch[] = [];

  for (const groupId of GROUP_IDS) {
    const groupTeams = teams.filter(t => t.group === groupId);

    if (groupTeams.length !== 4) {
      throw new Error(
        `Group ${groupId} has ${groupTeams.length} team(s) — expected 4. Check the dataset.`
      );
    }

    ROUND_ROBIN_PAIRS.forEach(([i, j], idx) => {
      matches.push({
        id: `${groupId}-${idx + 1}`,
        groupId,
        homeTeamId: groupTeams[i].id,
        awayTeamId: groupTeams[j].id,
        score: null,
      });
    });
  }

  return matches;
}
