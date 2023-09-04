export enum EffectType {
    giveItem = 1,
    fight = 2,
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