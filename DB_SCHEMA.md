# DB_SCHEMA.md — new_db.json Reference

`src/assets/data/new_db.json` is the single source of truth for all game content.
Loaded once at startup by `GameComponent`, parsed by `DataService` into rich object graphs.

---

## Top-level keys

```
skills[]  classes[]  items[]  actors[]  locations[]  stages[]  lastStage
```

---

## Items

```jsonc
{
  "id": 6,
  "name": "Little Health Potion",
  "description": "Heals 15 hp",
  "moneyValue": 150,
  "thumbnailPath": "assets/images/items/item2.png",
  "rarity": 0,              // 0=common 1=uncommon 2=rare 3=legendary
  "attack": 1,              // optional — equippable weapon bonus
  "defense": 1,             // optional — equippable armour bonus
  "effect": { "type": 3, "power": 15 }  // optional — usable item effect
}
```

**Special item — id 0:** represents `$100` cash. When received via any path,
`RunService.addItemToInventory` adds $100 to `inventory.money` instead of the bag.

---

## Actors

```jsonc
{
  "id": 26,
  "name": "Assessor n.1",
  "imagePath": "/assets/images/actors/actor4.png",
  "level": 3,
  "loot": [0, 9],           // item IDs — resolved to Item[] by DataService
  "dialogue": ["line 1", "line 2"],  // string or string[]
  "skills": [],
  "stats": {                // required to be targetable in combat
    "constitution": 25, "healthPoints": 25,
    "strength": 4, "dexterity": 6, "intelligence": 2,
    "charisma": 1
  },
  "equipment": [8],         // item IDs worn; bonuses applied at damage-time
  "classId": 1,             // optional — links to a class entry
  "joinsParty": true,       // optional — actor joins party on fight-win
  "shop": [6, 7, 9],        // optional — item IDs sold in a shop UI
  "rest": true,             // optional — actor shows a Rest button
  "revive": true,           // optional — actor shows a Revive button
  "attackCooldown": 1500,   // optional — ms between auto-attacks (default varies)
  "interactions": [ /* see below */ ]
}
```

---

## Interactions

Each actor holds an `interactions[]` array. The engine evaluates them in
`RunService.interact()` (item used on actor) and `RunService.talkTo()` (Talk button).

### reactTo

| Value | Trigger |
|---|---|
| `number` (item id) | Player uses that item on this actor |
| `"talk"` | Player clicks Talk on this actor |
| `"kill"` | Another actor in the same location was just killed |
| `"heal"` | A heal skill was cast on this actor |

### effect (EffectType enum)

| Value | Name | Meaning |
|---|---|---|
| `1` | giveItem | Give effectTarget items to player |
| `2` | fight | Start a fight against effectTarget characters |
| `3` | heal | Heal actor |
| `5` | kill | Actor is removed (side-effect trigger) |
| `13` | vanishes | Actor disappears from location |
| `14` | talk | Dialogue only |

### Full interaction example

```jsonc
{
  "reactTo": 20,            // Silver Bar used on actor
  "text": "ARGH!",          // displayed in text log (string or string[])
  "effect": 2,              // the action causes the effect -> fight is the effect in this case
  "actorVanishes": true,    // remove THIS actor from scene after effect resolves
  "locksDoor": true,        // location exit is blocked until interaction resolves
  "storyChildrenIds": [33, 34],  // push these location IDs to nextQuestlinePhase
  "effectTarget": [         // for effect 2: inline enemy definitions (see below)
    {
      "name": "Disguised Vampire",
      "level": 2,
      "imagePath": "...",
      "loot": [0, 0],       // item IDs — resolved at fight-prep time
      "stats": { "constitution": 15, "healthPoints": 15, "strength": 2,
                 "dexterity": 6, "intelligence": 10, "charisma": 2 },
      "skills": []
    }
  ]
}
```

For **effect 1** (giveItem), `effectTarget` is an array of item IDs: `[6, 20]`.

### locksDoor

`location.component.ts:locked()` returns true while ANY actor in the location
still has a **pending** (unresolved) interaction with `locksDoor: true`.
The interaction is resolved (removed) when it fires. Use only for mandatory
gates (e.g. a fight the player must trigger). Simple give/talk rewards must
NOT use `locksDoor`.

### Inline fight targets

Actors defined inside `effectTarget` of a fight interaction are never in the
actors array — they have no persistent `id`. `RunService.prepareFight()` assigns
a temporary unique ID from `_fightIdCounter` (starting at 90000) and resolves
their `loot` number arrays into Item objects.

---

## Locations

```jsonc
{
  "id": 13,
  "name": "City Hall",
  "backgroundPath": "/assets/images/locations/location4-bg.png",
  "storylineCounter": 1.5,  // added to questlineCounter on exit
  "children": [33, 34],     // location IDs set as nextQuestlinePhase on entry
  "fight": [26, 27],        // actor IDs — auto-fight triggered on entry
  "loot": [6],              // item IDs — given to party on entry
  "actors": [48, 49]        // actor IDs shown in location scene
}
```

**`children` vs `storyChildrenIds`:**
- `children` on a location: set `nextQuestlinePhase` deterministically when entering.
- `storyChildrenIds` on an interaction: append to `nextQuestlinePhase` when that
  interaction fires (used for branching choices mid-location).

---

## Stages

```jsonc
{
  "id": 0,
  "name": "Damned Citadel",
  "bossLocation": 0,         // location ID of the boss gate
  "questlines": [12, 13],    // location IDs that start each questline (shown at game start)
  "locations": [1,2,3,...]   // random pool — MAX_STAGE_ELEMENTS drawn at a time
}
```

---

## Questline progression

1. Stage questline entry points (listed in `stage.questlines`) are shown on the map at start.
2. When a player leaves a location, `questlineCounter += location.storylineCounter`.
3. If `questlineCounter >= 1.5 + (level-1)*0.2`, it resets and `refreshLocations(true)` is called,
   showing `nextQuestlinePhase` instead of the random pool.
4. `nextQuestlinePhase` is populated either by `location.children` (on entry) or
   by `storyChildrenIds` on resolved interactions (mid-location, for branching).
