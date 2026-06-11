import { computeGroupStandings } from './standings';
import type { GroupMatch, Team } from './types';

const BASE_TEAMS: Team[] = [1, 2, 3, 4].map(id => ({
  id,
  name: `T${id}`,
  code: `T${id}`,
  confederation: 'UEFA' as const,
  fifaRanking: id,
  group: 'A' as const,
}));

function m(
  id: string,
  home: number,
  away: number,
  score: { home: number; away: number } | null = null
): GroupMatch {
  return { id, groupId: 'A', homeTeamId: home, awayTeamId: away, score };
}

describe('computeGroupStandings', () => {
  it('returns all 4 teams with zero stats when no matches are played', () => {
    const standings = computeGroupStandings('A', BASE_TEAMS, []);
    expect(standings).toHaveLength(4);
    expect(standings.every(s =>
      s.played === 0 && s.points === 0 && s.goalDifference === 0
    )).toBe(true);
  });

  it('orders zero-stats teams by FIFA ranking ascending', () => {
    expect(computeGroupStandings('A', BASE_TEAMS, []).map(s => s.teamId)).toEqual([1, 2, 3, 4]);
  });

  it('accumulates a win correctly', () => {
    const standings = computeGroupStandings('A', BASE_TEAMS, [
      m('1', 1, 2, { home: 3, away: 1 }),
    ]);
    const winner = standings.find(s => s.teamId === 1)!;
    const loser = standings.find(s => s.teamId === 2)!;
    expect(winner).toMatchObject({ teamId: 1, played: 1, won: 1, drawn: 0, lost: 0, goalsFor: 3, goalsAgainst: 1, goalDifference: 2, points: 3 });
    expect(loser).toMatchObject({ teamId: 2, played: 1, won: 0, drawn: 0, lost: 1, goalsFor: 1, goalsAgainst: 3, goalDifference: -2, points: 0 });
  });

  it('accumulates a draw correctly', () => {
    const standings = computeGroupStandings('A', BASE_TEAMS, [
      m('1', 1, 2, { home: 1, away: 1 }),
    ]);
    const t1 = standings.find(s => s.teamId === 1)!;
    const t2 = standings.find(s => s.teamId === 2)!;
    expect(t1).toMatchObject({ played: 1, won: 0, drawn: 1, lost: 0, points: 1 });
    expect(t2).toMatchObject({ played: 1, won: 0, drawn: 1, lost: 0, points: 1 });
  });

  it('ranks teams with more points higher', () => {
    const standings = computeGroupStandings('A', BASE_TEAMS, [
      m('1', 1, 2, { home: 1, away: 0 }),
      m('2', 3, 4, { home: 0, away: 1 }),
    ]);
    expect(standings[0].points).toBeGreaterThan(standings[2].points);
    expect(standings.slice(0, 2).map(s => s.teamId).sort()).toEqual([1, 4]);
  });

  it('breaks points tie by goal difference', () => {
    const standings = computeGroupStandings('A', BASE_TEAMS, [
      m('1', 1, 3, { home: 3, away: 0 }), // team 1: 3pts, GD+3
      m('2', 2, 4, { home: 1, away: 0 }), // team 2: 3pts, GD+1
    ]);
    expect(standings[0].teamId).toBe(1);
    expect(standings[1].teamId).toBe(2);
  });

  it('breaks goal-difference tie by goals scored', () => {
    const standings = computeGroupStandings('A', BASE_TEAMS, [
      m('1', 1, 3, { home: 3, away: 1 }), // team 1: 3pts, GD+2, GF3
      m('2', 2, 4, { home: 2, away: 0 }), // team 2: 3pts, GD+2, GF2
    ]);
    expect(standings[0].teamId).toBe(1);
    expect(standings[1].teamId).toBe(2);
  });

  it('breaks overall tie by H2H result', () => {
    // team 1 and team 2: each 3pts, GD=0, GF=1, GA=1
    // direct match: team 1 beat team 2 → should rank above team 2
    const standings = computeGroupStandings('A', BASE_TEAMS, [
      m('1', 1, 2, { home: 1, away: 0 }), // team 1 beats team 2
      m('2', 3, 1, { home: 1, away: 0 }), // team 3 beats team 1
      m('3', 2, 4, { home: 1, away: 0 }), // team 2 beats team 4
    ]);
    const ids = standings.map(s => s.teamId);
    expect(ids.indexOf(1)).toBeLessThan(ids.indexOf(2));
  });

  it('H2H result overrides FIFA ranking', () => {
    // team 4 (FIFA rank 4) beat team 1 (FIFA rank 1) directly
    // both end on 3pts, GD=0, GF=1, GA=1 — identical overall stats
    // team 4 must finish above team 1 despite inferior FIFA rank
    const standings = computeGroupStandings('A', BASE_TEAMS, [
      m('1', 4, 1, { home: 1, away: 0 }), // team 4 beats team 1
      m('2', 1, 3, { home: 1, away: 0 }), // team 1 beats team 3
      m('3', 2, 4, { home: 1, away: 0 }), // team 2 beats team 4
    ]);
    const ids = standings.map(s => s.teamId);
    expect(ids.indexOf(4)).toBeLessThan(ids.indexOf(1));
  });

  it('H2H mini-table excludes matches involving teams outside the tied cluster', () => {
    // teams 1, 2, 3: each 6pts, GD+1, GF2 — cyclic H2H ties them → FIFA ordering
    // team 4's matches must not pollute the H2H calculation for {1,2,3}
    const standings = computeGroupStandings('A', BASE_TEAMS, [
      m('1', 1, 2, { home: 1, away: 0 }),
      m('2', 2, 3, { home: 1, away: 0 }),
      m('3', 3, 1, { home: 1, away: 0 }),
      m('4', 1, 4, { home: 1, away: 0 }),
      m('5', 2, 4, { home: 1, away: 0 }),
      m('6', 4, 3, { home: 0, away: 1 }),
    ]);
    expect(standings.map(s => s.teamId)).toEqual([1, 2, 3, 4]);
  });

  it('falls back to FIFA ranking when all criteria including H2H are equal', () => {
    // 1-1 draw: equal pts, GD, GF in both overall and H2H → FIFA rank decides
    const ids = computeGroupStandings('A', BASE_TEAMS, [
      m('1', 1, 2, { home: 1, away: 1 }),
    ]).map(s => s.teamId);
    expect(ids.indexOf(1)).toBeLessThan(ids.indexOf(2));
  });

  it('ignores matches from other groups', () => {
    const foreign: GroupMatch = { id: 'B-1', groupId: 'B', homeTeamId: 1, awayTeamId: 2, score: { home: 3, away: 0 } };
    expect(computeGroupStandings('A', BASE_TEAMS, [foreign]).every(s => s.played === 0)).toBe(true);
  });

  it('ignores matches with null scores', () => {
    expect(computeGroupStandings('A', BASE_TEAMS, [m('1', 1, 2, null)]).every(s => s.played === 0)).toBe(true);
  });
});
