/**
 * Stats (and equipment-derived values) that a buff can modify.
 * Keys that mirror Stats properties affect character.stats directly when queried.
 * 'attack' and 'defense' are additive on top of equipment bonuses.
 */
export type BuffableStat =
    | 'strength'
    | 'dexterity'
    | 'constitution'
    | 'intelligence'
    | 'wisdom'
    | 'charisma'
    | 'attack'
    | 'defense';

export enum BuffType {
    /** Temporarily boosts or reduces a stat. */
    statBoost = 'statBoost',
    /** Target can only attack the character who applied this buff. */
    taunt = 'taunt',
    /** Deals fixed damage to the bearing character at the start of their turn. */
    poison = 'poison',
    /** Bearing character skips their next turn. */
    stun = 'stun',
}

export class Buff {
    type: BuffType;
    /**
     * Which stat this buff modifies (mandatory for statBoost, ignored by others).
     */
    stat?: BuffableStat;
    /** Magnitude of the effect (positive = boost, negative = debuff). */
    power: number;
    /**
     * Turns remaining.
     * Use -1 for permanent buffs (e.g. equipment-granted bonuses that stay
     * as long as the item is equipped — these are not tracked in activeBuffs,
     * but the same class can be reused for description purposes).
     */
    duration: number;
    /**
     * ID of the character who applied this buff.
     * Used by taunt to know which character the affected enemy must target.
     */
    sourceCharacterId?: number;

    constructor(type: BuffType, power: number, duration: number, stat?: BuffableStat, sourceCharacterId?: number) {
        this.type = type;
        this.power = power;
        this.duration = duration;
        this.stat = stat;
        this.sourceCharacterId = sourceCharacterId;
    }
}