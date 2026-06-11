import { generateGroupFixtures, GROUP_IDS } from './fixtures';
import type { GroupId, Team } from './types';

function makeMockTeams(groupIds: GroupId[] = GROUP_IDS): Team[] {
  let counter = 1;
  return groupIds.flatMap(group =>
    Array.from({ length: 4 }, (_, i) => {
      const id = counter++;
      return {
        id,
        name: `Team-${group}-${i + 1}`,
        code: 'xx',
        confederation: 'UEFA' as const,
        fifaRanking: id,
        group,
      };
    })
  );
}

describe('generateGroupFixtures', () => {
  it('returns 72 matches for a full 48-team dataset', () => {
    expect(generateGroupFixtures(makeMockTeams())).toHaveLength(72);
  });

  it('produces exactly 6 matches per group', () => {
    const matches = generateGroupFixtures(makeMockTeams());
    for (const groupId of GROUP_IDS) {
      expect(matches.filter(m => m.groupId === groupId)).toHaveLength(6);
    }
  });

  it('every team plays exactly 3 matches', () => {
    const teams = makeMockTeams();
    const matches = generateGroupFixtures(teams);
    for (const team of teams) {
      const played = matches.filter(
        m => m.homeTeamId === team.id || m.awayTeamId === team.id
      ).length;
      expect(played).toBe(3);
    }
  });

  it('no team plays itself', () => {
    for (const match of generateGroupFixtures(makeMockTeams())) {
      expect(match.homeTeamId).not.toBe(match.awayTeamId);
    }
  });

  it('no pair of teams meets more than once within a group', () => {
    const matches = generateGroupFixtures(makeMockTeams());
    for (const groupId of GROUP_IDS) {
      const seen = new Set<string>();
      for (const m of matches.filter(m => m.groupId === groupId)) {
        const key = [m.homeTeamId, m.awayTeamId].sort().join('-');
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    }
  });

  it('all scores start as null', () => {
    for (const match of generateGroupFixtures(makeMockTeams())) {
      expect(match.score).toBeNull();
    }
  });

  it('all match IDs are unique', () => {
    const ids = generateGroupFixtures(makeMockTeams()).map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each match groupId matches the group of both participating teams', () => {
    const teams = makeMockTeams();
    const teamMap = new Map(teams.map(t => [t.id, t]));
    for (const match of generateGroupFixtures(teams)) {
      expect(teamMap.get(match.homeTeamId)?.group).toBe(match.groupId);
      expect(teamMap.get(match.awayTeamId)?.group).toBe(match.groupId);
    }
  });

  it('throws a descriptive error when a group has fewer than 4 teams', () => {
    // slice(1) removes the first team (group A), leaving group A with only 3 teams
    const teams = makeMockTeams().slice(1);
    expect(() => generateGroupFixtures(teams)).toThrow(/Group A has 3 team/);
  });
});
