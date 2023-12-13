import { EffectType } from "./Interaction";

export class Skill {

    id: number = 0;
    name: string = '';
    effect: EffectType = EffectType.giveItem;
    effectTarget: string = '';
    power: number = 0;
    aoe: boolean = false;
    cost: number = 99;

    constructor() {
    }
}