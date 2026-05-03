# Handoff: Items — Inventory & Shop UI

## Overview
This package documents the design for the **item row component**, used in two contexts in Dragon Mountain:
1. **Inventory panel** (left sidebar) — shows items the player carries, with `use` / `equip` actions
2. **Shop panel** (right sidebar) — shows merchant wares with `buy` / `too costly` / `bought` states

The designs introduce a **5-tier rarity system** with per-tier pixelated border colors and glow animations, a **hover tooltip** with full item details, and inline stat chips.

---

## About the Design Files

The files bundled here are **HTML design prototypes** — they demonstrate intended look, feel, and interactive behavior. They are **not production code** to copy directly.

Your task is to **recreate these designs inside the existing Angular codebase** (`src/app/common/items-table/`) using Angular components, SCSS, and Angular Material, following the patterns already established in the project. The HTML prototypes are your visual and behavioral specification.

---

## Fidelity

**High-fidelity.** These are pixel-perfect mockups with final colors, typography, spacing, and interactions. Recreate them precisely using the existing Alagard font, CSS custom properties, and the `pixelated-border` mixin already in `src/styles.scss`.

---

## Target Files in Codebase

| File | Role |
|------|------|
| `src/app/common/items-table/items-table.component.html` | Main template to update |
| `src/app/common/items-table/items-table.component.scss` | Styles to extend |
| `src/app/model/items/Item.ts` | Item model (add `rarity` field) |
| `src/app/model/items/Equip.ts` | Equipment model (already has `attack`, `defense`, `buffs`) |
| `src/styles.scss` | Global tokens and `pixelated-border` mixin |

---

## Screens / Views

### 1. Item Row (shared component — used in both inventory and shop)

**Layout:** `display: flex; align-items: center; gap: 14px; padding: 12px 16px; background: #000;`

**Zones (left → right):**

#### Zone 1 — Thumbnail (56×56px)
- `width: 56px; height: 56px; background: #0a0a0b;`
- Border: `1px solid <rarity-color>33`
- Image: `width: 48px; height: 48px; image-rendering: pixelated;`
- Compact mode (inside action-bar): `44×44px` container, `36×36px` image

#### Zone 2 — Item Info (flex: 1)
- **Name:** `font-family: "Alagard"; font-size: 22px; color: #F4E0B9;`
- **Rarity badge** (inline with name): `font-family: "PerfectDOS"; font-size: 10px; color: <rarity-color>; border: 1px solid <rarity-color>55; padding: 1px 5px;`
- **Type badge:** `font-family: "PerfectDOS"; font-size: 11px; color: #5a504a;` — format: `⚗ consumable` / `⚔ weapon` / `🗝 key` / `💀 relic`
- **Stat chips (inline):**
  - ATK: `font-size: 14px; color: #f16c6a;` — format: `atk +12`
  - DEF: `font-size: 14px; color: #4c7b94;` — format: `def +6`
  - Heal: `font-size: 14px; color: #BAD0DA;` — format: `heal 30`
  - SP restore: `font-size: 14px; color: #BAD0DA;` — format: `sp +40`

#### Zone 3 — Price + Action (flex-shrink: 0, align: flex-end)
- **Price:** `font-size: 20px; color: #22c55e; font-family: "Alagard";`
- **Action button:** see Button States below

---

### 2. Inventory Panel

- Existing `.actor-menu` / inventory sidebar structure — no layout changes needed
- Header: `font-size: 32px; color: white;` — text: `INVENTORY`
- Gold display: `font-size: 40px; color: green; background: #000;` — format: `1500 $`
- Item list: `<app-items-table [compact]="true">` — uses `details` column only (no separate icon column)

### 3. Shop Panel

- Existing `.shop` overlay structure — no layout changes needed
- Same item rows as inventory but with `buy` / `too costly` / `bought` button states
- Gold balance shown at top (same style as inventory)

---

## Interactions & Behavior

### Hover state (on item row)
```scss
&:hover {
  transform: scale(1.015);
  filter: brightness(1.1) drop-shadow(0 0 8px #{$rarity-color}66);
  // + shimmer sweep pseudo-element (see below)
}
```

**Shimmer sweep on hover:**
```scss
&:hover::after {
  content: "";
  position: absolute; top: 0; left: -20%; width: 15%; height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent);
  transform: skew(-10deg);
  animation: shimRow 0.5s ease forwards;
  pointer-events: none;
}
@keyframes shimRow { from { left: -20%; } to { left: 110%; } }
```

### Tooltip
- Appears after **180ms** hover delay (use Angular `@HostListener` + `setTimeout`)
- Position: fixed, to the right of the row; flips left if it would overflow viewport
- Disappears immediately on mouse leave
- **Structure:**
  - 40×40 pixel-art thumbnail (pixelated rendering)
  - Name (20px) + type · RARITY label (12px, PerfectDOS, rarity color)
  - Horizontal rule: `1px solid <rarity-color>44`
  - Description text (15px, color: `#c8b89a`, line-height: 1.5)
  - Stat chips: ATK / DEF side by side (background: `#1a1a1f`, border: `1px solid <rarity-color>44`)
  - Buff tags: `background: #1a1a1f; border: 1px solid #333; font-size: 11px; color: #BAD0DA; padding: 2px 7px;`
  - Price: `font-size: 18px; color: #22c55e;`
- Border: `2px solid <rarity-color>`
- Box-shadow: `0 0 16px <rarity-color>55, 4px 4px 0 #000`
- Animation: `opacity 0 → 1 + translateX(-6px → 0)` over `0.12s ease-out`

### Buy action (shop)
- On click: deduct `item.shopPrice` from `run.inventory.money`
- Button becomes `bought` (disabled) after purchase
- Button becomes `too costly` (disabled, pointer: not-allowed) when `run.inventory.money < item.shopPrice`
- These are reactive — update when gold changes

### Use action (inventory — consumables)
- Calls existing `runService.useItemOn(item, target)` — no change needed
- Optionally remove from inventory list after use (already handled by run state)

### Equip action (inventory — equipment)
- Calls existing equip slot logic via `uiService`

---

## Rarity System

### Model change
Add `rarity` field to `Item`:
```typescript
// Item.ts
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export class Item {
  // ...existing fields...
  rarity: Rarity = 'common';
}
```

### CSS tokens (add to `:root` in `styles.scss`)
```scss
--rarity-common:    #9a9a9a;
--rarity-uncommon:  #22c55e;
--rarity-rare:      #4c7b94;
--rarity-epic:      #9b59b6;
--rarity-legendary: #F1C66A;
```

### Rarity border mixin
The existing `pixelated-border` mixin in `styles.scss` uses `--color-primary` (#F4E0B9) for the border color. For rarity, create variants using the same `other()` mixin:

```scss
// In items-table.component.scss
@each $rarity, $color in (
  'uncommon': #22c55e,
  'rare':     #4c7b94,
  'epic':     #9b59b6,
  'legendary':#F1C66A
) {
  .rarity-#{$rarity} {
    @include other(2px, $color, black);
  }
}
// common uses the default .pixelated-border class
```

### Rarity glow animations
```scss
.rarity-rare      { animation: rarePulse 3s ease-in-out infinite; }
.rarity-epic      { animation: epicPulse 2.5s ease-in-out infinite; }
.rarity-legendary { animation: legendaryPulse 2s ease-in-out infinite; }

@keyframes rarePulse      { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.3) drop-shadow(0 0 6px #4c7b94)} }
@keyframes epicPulse      { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.4) drop-shadow(0 0 8px #9b59b6)} }
@keyframes legendaryPulse { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.5) drop-shadow(0 0 12px #F1C66A)} }
```

---

## Button States

| State | Background | Color | Cursor | Condition |
|-------|-----------|-------|--------|-----------|
| `use` / `equip` | `#F4E0B9` | `#000` | pointer | inventory, item usable |
| `buy` | `#4c7b94` | `#BAD0DA` | pointer | shop, affordable |
| `bought` | `#222` | `#444` | not-allowed | shop, already purchased |
| `too costly` | `#222` | `#444` | not-allowed | shop, gold < price |

All buttons: `font-family: "Alagard"; font-size: 16px; border: none; padding: 4px 14px;`
Hover (enabled only): `transform: scale(1.07); transition: transform 0.1s ease;`

---

## Design Tokens Used

All already defined in `src/styles.scss` `:root` — **no new tokens needed** except rarity ones above.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#F4E0B9` | Item name, common border, button bg |
| `--color-money` | `#22c55e` | Price display, uncommon border |
| `--attack-color` | `#f16c6a` | ATK stat chip color |
| `--skill-color` | `#4c7b94` | DEF stat chip color, buy button bg |
| `--skill-contrast` | `#BAD0DA` | Buy button text, buff tag text |
| `--color-surface-2` | `#1a1a1f` | Stat chip bg, buff tag bg |
| `--font-body` | `"Alagard"` | All item text |
| `--font-mono` | `"PerfectDOS"` | Type badge, rarity badge, tooltip meta |
| `--shadow-text` | `2px 1px 2px #7D7463` | Applied globally already |

---

## Assets

| File | Usage |
|------|-------|
| `src/assets/images/items/item1.png` | Crimson Potion — consumable |
| `src/assets/images/items/item2.png` | Brew of Daring — consumable |
| `src/assets/images/items/item3.png` | Azure Arcanum — consumable |
| `src/assets/images/items/item4.png` | Skeleton Key — key |
| `src/assets/images/items/item5.png` | Shadow Dagger — weapon |
| `src/assets/images/items/item6.png` | Wretched Skull — relic |

All images are **pixel art** — always render with `image-rendering: pixelated` (and `-webkit-optimize-contrast` for Safari).

---

## Files in This Package

| File | Description |
|------|-------------|
| `README.md` | This document |
| `Inventory & Shop Design.html` | Interactive prototype — open in browser to see live behavior |
| `Dragon Mountain Design System.html` | Full design system — see Section 8 "Items" for component specs |

---

## Implementation Notes for Claude Code

1. **Start with the `Item` model** — add the `rarity` field with default `'common'`
2. **Update `items-table.component.scss`** — add the rarity mixin variants and glow keyframes
3. **Update `items-table.component.html`** — swap `mat-row` class binding to use `[class]="'pixelated-border rarity-' + row.rarity"` (or equivalent Angular class binding)
4. **Add the tooltip** — create a new `ItemTooltipComponent` or use Angular CDK Overlay for positioning. The prototype uses fixed positioning with JS — CDK Overlay is the Angular-idiomatic equivalent.
5. **Add stat chips** — already available on `Equip` model (`attack`, `defense`, `buffs`). Add `effect` display for `Item` base class.
6. **Shop buy logic** — the `buy()` method in `ui-layer.component.ts` already handles deduction; wire the `too costly` / `bought` states to `run.inventory.money` reactively via `*ngIf` on the button label.
7. **Compact mode** — `[compact]="true"` input already exists; use it to reduce thumbnail to 44px and font sizes slightly.
