import { EffectType } from "../Interaction";

export class ItemEffect {

    public type: EffectType;
    // amplitude of the effect, 999999 is full
    public power: number;

    constructor() {
        this.type = EffectType.heal;
        this.power = 0;
    }
}