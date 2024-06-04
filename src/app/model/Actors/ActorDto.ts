
import { Interaction } from "../Interaction";

var idCounter = 0;

export class ActorDto {

    id = 0;
    imagePath: string = "/assets/images/actors/actor1.png";
    name: string = "Hero";
    loot: number[] = [];
    shop?: number[] = [];
    rest?: boolean = false;
    equipment: number[] = [];
    interactions: Interaction[] = [];
    dialogue: string[] = [''];
    clearanceRequirements: [] = [];
    clearanceDialogue: [] = [];

    constructor() {
        this.id = idCounter++;
    }
}