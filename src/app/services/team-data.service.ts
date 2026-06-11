import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import type { Team } from '../domain/types';

@Injectable({ providedIn: 'root' })
export class TeamDataService {
  private readonly http = inject(HttpClient);

  teams: Team[] = [];

  load(): Promise<void> {
    return lastValueFrom(
      this.http.get<{ teams: Team[] }>('/teams-2026.json').pipe(
        tap(data => { this.teams = data.teams; }),
        map(() => void 0)
      )
    );
  }
}
