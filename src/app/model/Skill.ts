import { EffectType } from "./Interaction";

export class Skill {

    id: number = 0;
    name: string = '';
    effect: EffectType = EffectType.damage;
    effectTarget: string = '';
    power: number = 0;
    aoe: boolean = false;

    constructor() {
    }
}