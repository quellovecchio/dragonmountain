import { Item } from './items/Item';
import { Stats } from './Stats';

export enum EffectType {
    giveItem = 1,
    fight = 2,
    heal = 3,
    damage = 4,
    kill = 5,
    buffStat = 6,
    resurrect = 7,
    explore = 8,
    flee = 9,
    magicDamage = 10,
    steal = 11,
    taunt = 12,
    vanishes = 13,
    talk = 14,
}

/**
 * An actor defined inline inside an interaction (not referenced by ID from actors[]).
 * Structurally compatible with Character for the purposes of startFight / prepareFight.
 */
export interface InlineFightTarget {
    name: string;
    level: number;
    imagePath: string;
    loot: Item[];
    dialogue: string | string[];
    stats: Partial<Stats>;
    equipment?: number[];
    skills: number[];
}

/**
 * Shared fields present on every interaction regardless of effect type.
 *
 * reactTo semantics:
 *   number  → triggered when the item with that ID is used on this actor
 *   string  → triggered when a specific EffectType fires (e.g. "heal", "talk", "kill")
 */
interface InteractionBase {
    reactTo: number | string;
    text: string | string[];
    locksDoor?: boolean;
    storyChildrenIds?: number[];
    /** When true the triggering actor is removed from the scene after the effect fires. */
    actorVanishes?: boolean;
}

/** Gives one or more items (by ID) to the player party. */
export interface GiveItemInteraction extends InteractionBase {
    effect: EffectType.giveItem;
    effectTarget: number[];
}

/** Starts a fight with inline-defined enemies. */
export interface FightInteraction extends InteractionBase {
    effect: EffectType.fight;
    effectTarget: InlineFightTarget[];
}

/** Removes this actor from the current location. */
export interface VanishInteraction extends InteractionBase {
    effect: EffectType.vanishes;
    effectTarget?: undefined;
}

/** Logically marks this actor as killed / triggers a kill-related story beat. */
export interface KillInteraction extends InteractionBase {
    effect: EffectType.kill;
    effectTarget?: undefined;
}

/** Used as a cause (reactTo: "talk") to react when the player talks to the actor. */
export interface TalkInteraction extends InteractionBase {
    effect: EffectType.talk;
    effectTarget?: undefined;
}

/**
 * Discriminated union of all interaction types.
 * Narrowing on `interaction.effect` gives full type-safety over `effectTarget`.
 */
export type Interaction =
    | GiveItemInteraction
    | FightInteraction
    | VanishInteraction
    | KillInteraction
    | TalkInteraction;