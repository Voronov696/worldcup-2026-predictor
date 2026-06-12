# FIFA World Cup 2026 — Prediction Bracket

> An application that allows any football fan to build their complete scenario for the 2026 World Cup — from the first kick to the final — and save it.

A web application where the user predicts every match of the FIFA World Cup 2026 (Canada / Mexico / United States, June 11 – July 19, 2026). The first tournament with **48 teams** in **12 groups of 4**. As scores are entered, group standings recompute live following FIFA's official tiebreaker chain (including head-to-head). Predictions persist across page reloads.

---

## Installation and launch

```bash
git clone https://github.com/Voronov696/worldcup-2026-predictor.git
cd worldcup-2026-predictor
npm install
npm start
```

Open `http://localhost:4200`.

Run the unit tests:

```bash
npm test
```

All 28 unit tests of the domain layer must pass.

---

## Tech stack and justification

| Choice | Why |
| --- | --- |
| **Angular (standalone components)** | No NgModules: each component declares its own imports. Simpler dependency graph, defended one component at a time. |
| **Angular signals** | Native reactive primitive (Angular 17+). State is a single `signal<AppState>` exposed read-only; views recompute via `computed()` and auto-persist via `effect()`. No NgRx, no RxJS subjects — the brief explicitly says *"no Redux if signals suffice"*. |
| **TypeScript strict** | Strict null checks. Union types (`GroupId`, `Confederation`, `KnockoutRound`) make illegal states unrepresentable. |
| **Vitest (domain layer)** | Fast, runs the framework-free domain layer directly. Used in place of Angular's default Karma/Jasmine setup because the tested code has zero Angular dependencies. |
| **`localStorage` persistence** | No backend required; the app is fully client-side. Persisted state uses a version sentinel (`{ v: 1, state }`) so future schema changes discard stale data cleanly. |
| **OnPush change detection** | All components use `ChangeDetectionStrategy.OnPush` — 72 match cards on screen, only the affected ones re-render on a score change. |
| **No SSR, no routing** | Single-page experience, fully client-side. Routing would add complexity with no UX benefit. |

---

## Implemented features

### Must-have

- Loads and parses `public/teams-2026.json` at startup via `APP_INITIALIZER` — team data is synchronously available everywhere before the first render.
- Displays the **12 groups** with team flags (CDN: `flagcdn.com`) and live standings tables.
- Score input on every group-stage match. Invalid, partial, and non-integer values are rejected at the boundary; a half-entered score is preserved until the user finishes the other field.
- Auto-calculated standings: **points (W=3, D=1, L=0), goal difference, goals scored**, recomputed live on every score change.
- **Full FIFA tiebreaker chain**: points → goal difference → goals scored → head-to-head → FIFA ranking (fair play omitted — see [Trade-offs](#trade-offs-and-limitations)).
- **Best-eight third-placed teams** selected out of the 12 third-placed teams for the Round of 32.
- Persistence: predictions survive page reload (`localStorage`).
- Responsive layout (CSS Grid `auto-fill minmax`, no media-query branching).
- Accessibility: `alt` text on every flag, `aria-label` on every score input, visible focus outlines, semantic table markup.
- Strict TypeScript, no `console.log`, no dead code.

### Planned (not in this submission)

- Knockout stage (Round of 32 → Final), seeded from the qualified teams with a documented custom scheme. The domain types and store already reserve space for it (`AppState.knockoutMatches`).

---

## Architecture

```
src/app/
├── domain/                          # pure TypeScript, framework-free, fully tested
│   ├── types.ts                     # union types and interfaces (single source of truth)
│   ├── fixtures.ts                  # round-robin pairing for 4-team groups
│   ├── standings.ts                 # standings engine with full tiebreaker chain
│   └── thirdPlace.ts                # best-eight third-placed selection
│
├── services/
│   ├── team-data.service.ts         # JSON fetch via APP_INITIALIZER
│   └── prediction-store.service.ts  # signal-based store + localStorage persistence
│
└── components/
    ├── groups-page/                 # top-level page, holds the computed() standings/matches per group
    ├── group-table/                 # display-only standings table
    └── match-card/                  # REUSABLE: works in group stage now, designed for knockout reuse
```

**Two-layer separation**: the `domain/` folder is pure TypeScript and never imports anything from Angular. This is what makes the 28 unit tests possible without a `TestBed`, and what would allow the business logic to be reused in another framework or a CLI tool.

---

## Business rules

### Group standings — tiebreaker chain

Applied in strict order, stopping as soon as two teams differ:

1. **Points** (win = 3, draw = 1, loss = 0)
2. **Goal difference** (overall)
3. **Goals scored** (overall)
4. **Head-to-head** — see below
5. ~~Fair play points~~ — *omitted, see [Trade-offs](#trade-offs-and-limitations)*
6. **FIFA ranking** (lower number = better)

#### Head-to-head — the subtle part

When `N ≥ 2` teams are level on points + GD + GS, head-to-head **cannot** be evaluated inside a pairwise sort comparator: a comparator only ever sees two teams, but H2H depends on the entire tied cluster simultaneously. Implementation in `standings.ts`:

1. Sort all 4 teams by points → GD → GS.
2. Walk the sorted list and find **contiguous clusters** of teams equal on all three criteria.
3. For each cluster of size ≥ 2, build a **mini-table** containing only the matches played between the tied teams.
4. Re-sort within the cluster by mini-table points → mini-table GD → mini-table GS.
5. Any teams still tied after the mini-table fall through to FIFA ranking.

Unit test `H2H result overrides FIFA ranking` proves correctness: a team with a *worse* FIFA ranking finishes *above* a better-ranked team because it won the direct match.

### Best-eight third-placed teams

The 12 third-placed teams come from different groups and have never played each other, so head-to-head **does not apply**. Cross-group ranking:

1. Points (DESC)
2. Goal difference (DESC)
3. Goals scored (DESC)
4. FIFA ranking (ASC, final tiebreaker)

The top 8 of the 12 advance to the Round of 32; the bottom 4 are eliminated.

---

## Trade-offs and limitations

These are deliberate, documented choices, not oversights.

- **Fair play points are skipped.** The provided dataset has no disciplinary data (yellow/red cards). Rather than insert a placeholder zero, the algorithm omits this step and falls through to FIFA ranking. The README is the source of truth for this decision.
- **Head-to-head is applied one level deep.** FIFA's official rules allow recursive H2H (if a 3-way H2H reduces to a 2-way sub-tie, apply H2H again to that pair). This implementation applies H2H once per cluster, then falls through to FIFA ranking. For a 4-team group with 3 matches per team, the scenarios where recursive H2H would yield a different result versus FIFA-ranking fallback are vanishingly rare.
- **Knockout stage is not in this submission.** The domain types and the signal store already include `knockoutMatches`. The bracket generation logic and bracket UI remain as the next milestone.
- **Custom seeding scheme planned** (for the knockout phase). Rather than reproduce FIFA's 495-row third-placed lookup table, the planned approach is a clean deterministic seeding: rank all 32 qualifiers (winners tier → runners-up tier → best-8 thirds), then pair seed N vs seed 33−N. The brief explicitly values a documented custom scheme equally with the official table. *(Knockout phase not delivered in this submission.)*
- **`tsconfig.spec.json` switched from Jasmine to Vitest types.** Because the tested code is the framework-free domain layer, Karma + Jasmine adds no value here. Vitest runs the domain tests directly under Node, in under one second.

---

## Testing

Domain unit tests live next to the code they exercise, in `src/app/domain/*.spec.ts`.

| File | Tests | Covers |
| --- | --- | --- |
| `fixtures.spec.ts` | 9 | Round-robin pairing, fixture count, no duplicate pairings, deterministic output |
| `standings.spec.ts` | 13 | Points formula, GD/GS tiebreakers, head-to-head (including override of FIFA ranking), partial-group handling, foreign-group filtering |
| `thirdPlace.spec.ts` | 6 | Cross-group ranking, 8/12 cut, FIFA-ranking final tiebreaker, exclusion of the 9th-ranked team |

**Total: 28 tests, all green.**

UI services and components are not unit-tested in this submission — they are exercised by manual end-to-end interaction (score entry → live standings update → persistence across reload). This is a deliberate scope trade-off: the testing budget was spent on the rule-engine logic where bugs would be silent and hard to spot manually.

---

## Project structure

```
worldcup-2026-predictor/
├── public/
│   └── teams-2026.json         # 48 teams, 12 groups, official tiebreaker order
├── src/
│   ├── app/
│   │   ├── domain/             # framework-free business logic (+ specs)
│   │   ├── services/           # signal store + JSON loader
│   │   ├── components/         # standalone Angular components
│   │   ├── app.component.*
│   │   └── app.config.ts       # HttpClient + APP_INITIALIZER
│   ├── index.html
│   ├── main.ts
│   └── styles.scss             # global reset + flag styles
├── vitest.config.ts            # Vitest scoped to src/app/domain only
├── CLAUDE.md                   # development workflow notes
├── README.md
├── angular.json
├── package.json
└── tsconfig*.json
```

---

## Acknowledgements

Flag images are served by [flagcdn.com](https://flagcdn.com).