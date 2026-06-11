import { effect, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import type { AppState, MatchScore } from '../domain/types';
import { generateGroupFixtures } from '../domain/fixtures';
import { TeamDataService } from './team-data.service';

const STORE_VERSION = 1;
const STORAGE_KEY = 'wc2026';

interface PersistedState {
  v: number;
  state: AppState;
}

@Injectable({ providedIn: 'root' })
export class PredictionStoreService {
  private readonly teamData = inject(TeamDataService);
  private readonly _state: WritableSignal<AppState>;
  readonly state: Signal<AppState>;

  constructor() {
    this._state = signal(this.loadInitialState());
    this.state = this._state.asReadonly();

    effect(() => {
      const payload: PersistedState = { v: STORE_VERSION, state: this._state() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    });
  }

  updateGroupScore(matchId: string, score: MatchScore | null): void {
    this._state.update(state => ({
      ...state,
      groupMatches: state.groupMatches.map(m =>
        m.id === matchId ? { ...m, score } : m
      ),
    }));
  }

  private loadInitialState(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as PersistedState;
        if (
          parsed.v === STORE_VERSION &&
          Array.isArray(parsed.state?.groupMatches) &&
          Array.isArray(parsed.state?.knockoutMatches)
        ) {
          return parsed.state;
        }
      }
    } catch {
      // corrupted — fall through to fresh state
    }
    return {
      groupMatches: generateGroupFixtures(this.teamData.teams),
      knockoutMatches: [],
    };
  }
}
