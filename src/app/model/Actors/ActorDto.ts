
import { Interaction } from "../Interaction";
import { Rarity } from "../common/Rarity";

var idCounter = 0;

export class ActorDto {

    id = 0;
    imagePath: string = "/assets/images/actors/actor1.png";
    rarity: Rarity = 'common';
    name: string = "Hero";
    loot: number[] = [];
    shop?: number[] = [];
    rest?: boolean = false;
    revive?: boolean = false;
    boss?: boolean = false;
    equipment: number[] = [];
    interactions: Interaction[] = [];
    dialogue: string[] = [''];
    // deprecated
    //clearanceRequirements: [] = [];
    clearanceDialogue: [] = [];

    constructor() {
        this.id = idCounter++;
    }
}