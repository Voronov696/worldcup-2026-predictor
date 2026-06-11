import { selectBestThirdPlaced } from './thirdPlace';
import type { GroupStanding, Team } from './types';

function s(teamId: number, points: number, gd: number, gf: number): GroupStanding {
  return {
    teamId, played: 3, won: 0, drawn: 0, lost: 0,
    goalsFor: gf, goalsAgainst: gf - gd, goalDifference: gd, points,
  };
}

// Wraps a third-place entry in a 4-team group; indices 0, 1, 3 are inert fillers.
function group(third: GroupStanding): GroupStanding[] {
  return [s(0, 9, 5, 8), s(0, 6, 2, 4), third, s(0, 0, -7, 1)];
}

function team(id: number, fifaRanking: number): Team {
  return { id, name: `T${id}`, code: `T${id}`, confederation: 'UEFA', fifaRanking, group: 'A' };
}

describe('selectBestThirdPlaced', () => {
  it('selects exactly 8 teams from 9 candidates', () => {
    const groups = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((id, i) => group(s(id, 9 - i, 0, 3)));
    const teams = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(id => team(id, id));
    expect(selectBestThirdPlaced(groups, teams)).toHaveLength(8);
  });

  it('excludes the 9th-ranked team', () => {
    const groups = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((id, i) => group(s(id, 9 - i, 0, 3)));
    const teams = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(id => team(id, id));
    const result = selectBestThirdPlaced(groups, teams);
    expect(result.map(r => r.teamId)).not.toContain(9); // team 9 has fewest points
  });

  it('ranks teams with more points higher', () => {
    const groups = [group(s(1, 6, 0, 2)), group(s(2, 3, 0, 2))];
    const teams = [team(1, 1), team(2, 2)];
    expect(selectBestThirdPlaced(groups, teams)[0].teamId).toBe(1);
  });

  it('breaks points tie by goal difference', () => {
    const groups = [group(s(1, 4, 3, 5)), group(s(2, 4, 1, 5))];
    const teams = [team(1, 1), team(2, 2)];
    expect(selectBestThirdPlaced(groups, teams)[0].teamId).toBe(1);
  });

  it('breaks goal-difference tie by goals scored', () => {
    const groups = [group(s(1, 4, 2, 5)), group(s(2, 4, 2, 3))];
    const teams = [team(1, 1), team(2, 2)];
    expect(selectBestThirdPlaced(groups, teams)[0].teamId).toBe(1);
  });

  it('uses FIFA ranking as final tiebreaker', () => {
    // team 1 and team 2 identical on pts, GD, GF — team 2 has better FIFA rank
    const groups = [group(s(1, 4, 2, 5)), group(s(2, 4, 2, 5))];
    const teams = [team(1, 10), team(2, 1)];
    expect(selectBestThirdPlaced(groups, teams)[0].teamId).toBe(2);
  });
});
