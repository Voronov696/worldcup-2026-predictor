export type Confederation = 'UEFA' | 'CONMEBOL' | 'AFC' | 'CAF' | 'CONCACAF' | 'OFC';

export type GroupId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';

export type KnockoutRound = 'R32' | 'R16' | 'QF' | 'SF' | 'Final';

export interface Team {
  id: number;
  name: string;
  code: string;
  confederation: Confederation;
  fifaRanking: number;
  group: GroupId;
  host?: boolean;
}

export interface MatchScore {
  home: number;
  away: number;
}

export interface GroupMatch {
  id: string;
  groupId: GroupId;
  homeTeamId: number;
  awayTeamId: number;
  score: MatchScore | null;
}

export interface GroupStanding {
  teamId: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface KnockoutMatch {
  id: string;
  round: KnockoutRound;
  matchIndex: number;
  homeTeamId: number | null;
  awayTeamId: number | null;
  score: MatchScore | null;
  winnerId: number | null;
}

export interface AppState {
  groupMatches: GroupMatch[];
  knockoutMatches: KnockoutMatch[];
}
