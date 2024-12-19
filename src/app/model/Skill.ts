import { EffectType } from "./Interaction";

var idCounter = 0;

export class Skill {

    id: number = 0;
    name: string = 'skill';
    effect: EffectType = EffectType.giveItem;
    effectTarget: string = '';
    power: number = 0;
    aoe: boolean = false;
    cost: number = 0;

    constructor() {
        this.id = idCounter++;
    }
}