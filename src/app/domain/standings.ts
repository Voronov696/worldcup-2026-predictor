import type { GroupId, GroupMatch, GroupStanding, Team } from './types';

export function computeGroupStandings(
  groupId: GroupId,
  teams: Team[],
  matches: GroupMatch[]
): GroupStanding[] {
  const groupTeams = teams.filter(t => t.group === groupId);
  const played = matches.filter(
    (m): m is GroupMatch & { score: NonNullable<GroupMatch['score']> } =>
      m.groupId === groupId && m.score !== null
  );

  const map = new Map<number, GroupStanding>(
    groupTeams.map(t => [t.id, {
      teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
    }])
  );

  for (const { homeTeamId, awayTeamId, score } of played) {
    const h = map.get(homeTeamId)!;
    const a = map.get(awayTeamId)!;
    h.played++; a.played++;
    h.goalsFor += score.home; h.goalsAgainst += score.away;
    a.goalsFor += score.away; a.goalsAgainst += score.home;
    if (score.home > score.away) {
      h.won++; h.points += 3; a.lost++;
    } else if (score.away > score.home) {
      a.won++; a.points += 3; h.lost++;
    } else {
      h.drawn++; h.points++;
      a.drawn++; a.points++;
    }
  }

  for (const s of map.values()) {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  }

  const fifaRank = new Map(teams.map(t => [t.id, t.fifaRanking]));

  function h2h(teamIds: number[]) {
    const ids = new Set(teamIds);
    const stats = new Map(teamIds.map(id => [id, { pts: 0, gd: 0, gf: 0 }]));
    for (const { homeTeamId, awayTeamId, score } of played) {
      if (!ids.has(homeTeamId) || !ids.has(awayTeamId)) continue;
      const h = stats.get(homeTeamId)!;
      const a = stats.get(awayTeamId)!;
      h.gf += score.home; h.gd += score.home - score.away;
      a.gf += score.away; a.gd += score.away - score.home;
      if (score.home > score.away) { h.pts += 3; }
      else if (score.away > score.home) { a.pts += 3; }
      else { h.pts++; a.pts++; }
    }
    return stats;
  }

  const rows = [...map.values()].sort((a, b) =>
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor
  );

  const result: GroupStanding[] = [];
  let i = 0;
  while (i < rows.length) {
    let j = i + 1;
    while (
      j < rows.length &&
      rows[j].points === rows[i].points &&
      rows[j].goalDifference === rows[i].goalDifference &&
      rows[j].goalsFor === rows[i].goalsFor
    ) j++;

    const cluster = rows.slice(i, j);
    if (cluster.length > 1) {
      const head = h2h(cluster.map(s => s.teamId));
      cluster.sort((a, b) => {
        const ha = head.get(a.teamId)!;
        const hb = head.get(b.teamId)!;
        return hb.pts - ha.pts ||
          hb.gd - ha.gd ||
          hb.gf - ha.gf ||
          fifaRank.get(a.teamId)! - fifaRank.get(b.teamId)!;
      });
    }
    result.push(...cluster);
    i = j;
  }

  return result;
}
