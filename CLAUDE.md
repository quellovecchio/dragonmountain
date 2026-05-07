# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build → dist/dragon-mountain/
npm test           # Unit tests via Karma/Jasmine
ng generate component path/name   # Scaffold a new component
```

No linter script is configured. Angular CLI version 14.

## Architecture Overview

Dragon Mountain is a text-based RPG built with Angular 14. The app has two routes:
- `/` → `GameComponent` — the playable game
- `/diy` → `DiyComponent` — an in-game content editor

### Service Layer (core logic)

**`DataService`** (`src/app/data.service.ts`) — Central data store. Loads all game content from `assets/data/new_db.json` at startup and exposes lookup methods (`getSkillById`, `getActorById`, `getLocationById`, etc.). Converts flat DTO objects into rich nested object graphs via `populate*` methods.

**`RunService`** (`src/app/services/run.service.ts`) — Game loop orchestrator. Owns the active `Run` instance and drives all state transitions: exploration, location entry, interactions, fight initiation, quest progression, experience spending. Dispatches interactions via a discriminated-union effect system (`giveItem`, `fight`, `heal`, `kill`, `talk`, `vanishes`, etc.).

**`FightManagerService`** (`src/app/services/fight-manager.service.ts`) — Turn-based combat engine. Handles damage calculation (with equipment stat bonuses applied at damage-time), the buff system (`statBoost`, `poison`, `stun`, `taunt` with duration tracking), skill casting with SP cost, and win/loot distribution. Note: there is a known bug when multiple enemies of the same type appear in a single fight.

**`UiService`** (`src/app/game/ui-layer/ui.service.ts`) — UI state manager. Uses RxJS `BehaviorSubject`s for reactive updates. Tracks inventory visibility, selected item/skill, text buffer, and portrait/landscape mode.

**`MusicService`** (`src/app/services/music.service.ts`) — Audio: background music looping and sound effects.

### Data Models (`src/app/model/`)

Character hierarchy:
- `Actor` — Generic NPC/enemy (no combat stats)
- `Character extends Actor` — Has stats, skills, equipment
- `PlayingCharacter extends Character` — Player party member

Game state:
- `Run` — Active game session: `party[]`, `inventory`, `stage`, `currentLocation`, `currentFight`, `experience`, `questlineCounter`
- `RunState` enum — `Neutral | Exploration | Location | Fight`

World:
- `Stage` — Contains `Location[]` pool, `questlines` (story start locations), `bossLocation`
- `Location` — Has `fight[]` enemies, `actors[]` NPCs, `loot[]` items, `children[]` IDs for quest branching, `storylineCounter`
- `Interaction` — Discriminated union: `GiveItemInteraction | FightInteraction | VanishInteraction | KillInteraction | TalkInteraction`. The `reactTo` field is either an item ID (number) or an `EffectType` string.

### Game Loop

1. **Intro** — Loads `assets/data/new_db.json`, populates `DataService`, starts at `stages[0]`
2. **Exploration** — Party picks from 3 random locations; can spend EXP to refresh, level up characters, or unlock the boss
3. **Location** — Encounter NPCs and loot; auto-triggers fight if `location.fight[]` is non-empty
4. **Fight** — Turn-based via `FightManagerService`; win → loot + EXP + story progression; loss → game over

### Dev Constants (`src/assets/constants.ts`)

```ts
DEBUG_SKIP_INTRO    // Skip intro for faster dev iteration
DEBUG_ROOM          // Enable debug logging
TEXT_SPEED          // Text display speed multiplier (default 10)
FIGHT_CLOCK_SPEED   // Combat tick rate in ms (default 90)
MAX_STAGE_ELEMENTS  // Locations shown at once (default 3)
```

Toggle `DEBUG_SKIP_INTRO` when working on gameplay — it skips the typed intro sequence.

### DIY Editor (`src/app/editor/`)

Lets players build custom stages, locations, NPCs, items, skills, and classes. Each entity type has its own editor component (`skills-editor`, `npcs-editor`, `locations-editor`, etc.) using Angular Material dialogs. `EditorService` handles editor-specific logic; `FileService` handles JSON import/export.

### Database & Interaction Schema

See **[DB_SCHEMA.md](./DB_SCHEMA.md)** for a full reference on how `new_db.json` is structured:
items, actors, interactions (`reactTo`, `effect`, `effectTarget`, `locksDoor`, `storyChildrenIds`),
locations (`children`, `storylineCounter`), stages, and questline progression logic.

### Known Pitfalls

- **Global ID counters**: Model files use module-level `idCounter` variables. Object creation order matters; be cautious when instantiating models outside the normal data-loading path.
- **Equipment buffs**: Attack/defense bonuses from equipment are calculated at damage-time inside `FightManagerService`, not stored on the character stats.
- **`clearanceRequirements`**: Marked deprecated in `RunService`; do not add new usages.
- **`Run.time`**: Field exists but is currently unused.
