import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { GroupStanding, Team } from '../../domain/types';

@Component({
  selector: 'app-group-table',
  imports: [],
  templateUrl: './group-table.component.html',
  styleUrl: './group-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupTableComponent {
  @Input() standings!: GroupStanding[];
  @Input() teamMap!: Map<number, Team>;

  teamName(teamId: number): string {
    return this.teamMap.get(teamId)?.name ?? '?';
  }
}
