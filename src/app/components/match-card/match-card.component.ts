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
      const m: GroupMatch = changes['match'].currentValue;
      this.homeValue = m.score?.home?.toString() ?? '';
      this.awayValue = m.score?.away?.toString() ?? '';
    }
  }

  onBlur(): void {
    const homeRaw = this.homeValue.trim();
    const awayRaw = this.awayValue.trim();

    if (homeRaw === '' || awayRaw === '') {
      this.scoreChange.emit({ matchId: this.match.id, score: null });
      return;
    }

    const home = parseInt(homeRaw, 10);
    const away = parseInt(awayRaw, 10);

    if (isNaN(home) || home < 0 || isNaN(away) || away < 0) {
      if (isNaN(home) || home < 0) this.homeValue = '';
      if (isNaN(away) || away < 0) this.awayValue = '';
      this.scoreChange.emit({ matchId: this.match.id, score: null });
      return;
    }

    this.scoreChange.emit({ matchId: this.match.id, score: { home, away } });
  }
}
