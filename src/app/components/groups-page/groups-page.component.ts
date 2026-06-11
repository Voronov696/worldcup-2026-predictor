import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GroupTableComponent } from '../group-table/group-table.component';
import { MatchCardComponent } from '../match-card/match-card.component';
import { PredictionStoreService } from '../../services/prediction-store.service';
import { TeamDataService } from '../../services/team-data.service';
import { computeGroupStandings } from '../../domain/standings';
import { GROUP_IDS } from '../../domain/fixtures';
import type { GroupId, MatchScore, Team } from '../../domain/types';

@Component({
  selector: 'app-groups-page',
  imports: [GroupTableComponent, MatchCardComponent],
  templateUrl: './groups-page.component.html',
  styleUrl: './groups-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupsPageComponent {
  private readonly store = inject(PredictionStoreService);
  private readonly teamData = inject(TeamDataService);

  readonly groupIds: GroupId[] = GROUP_IDS;
  readonly teamMap: Map<number, Team>;

  readonly groupedMatches = computed(() => {
    const matches = this.store.state().groupMatches;
    return new Map(GROUP_IDS.map(id => [id, matches.filter(m => m.groupId === id)]));
  });

  readonly groupStandings = computed(() =>
    new Map(GROUP_IDS.map(id => [
      id,
      computeGroupStandings(id, this.teamData.teams, this.store.state().groupMatches),
    ]))
  );

  constructor() {
    this.teamMap = new Map(this.teamData.teams.map(t => [t.id, t]));
  }

  onScoreChange(event: { matchId: string; score: MatchScore | null }): void {
    this.store.updateGroupScore(event.matchId, event.score);
  }
}
