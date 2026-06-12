import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { GroupMatch, MatchScore, Team } from '../../domain/types';

@Component({
  selector: 'app-match-card',
  imports: [FormsModule],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchCardComponent implements OnChanges {
  @Input() match!: GroupMatch;
  @Input() homeTeam!: Team;
  @Input() awayTeam!: Team;
  @Output() scoreChange = new EventEmitter<{ matchId: string; score: MatchScore | null }>();

  homeValue = '';
  awayValue = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['match']) {
      const prev: GroupMatch | undefined = changes['match'].previousValue;
      const curr: GroupMatch = changes['match'].currentValue;
      if (prev?.id !== curr.id) {
        this.homeValue = curr.score?.home?.toString() ?? '';
        this.awayValue = curr.score?.away?.toString() ?? '';
      }
    }
  }

  onBlur(): void {
    const coerce = (val: unknown): number | null => {
      if (val === '' || val === null || val === undefined) return null;
      const n = Number(val);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) return null;
      return n;
    };
    const home = coerce(this.homeValue);
    const away = coerce(this.awayValue);
    if (home === null && away === null) {
      this.homeValue = '';
      this.awayValue = '';
      this.scoreChange.emit({ matchId: this.match.id, score: null });
      return;
    }
    if (home !== null && away !== null) {
      this.scoreChange.emit({ matchId: this.match.id, score: { home, away } });
      return;
    }
    // partial entry — one field filled, one empty; do not emit, do not clear
  }
}
