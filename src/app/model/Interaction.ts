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
    steal = 11
    // TODO add interactions
}

export class Interaction {

    reactTo: string = "";
    text: string = "";
    effect: EffectType = EffectType.giveItem;
    effectTarget: any;
    vanishes: boolean = false;

    constructor() {
    } 

    fire() {
        console.log("fired generic action")
    }
}