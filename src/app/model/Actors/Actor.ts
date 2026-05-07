
import { Interaction } from "../Interaction";
import { Equip } from "../items/Equip";
import { Item } from "../items/Item";
import { Requirement } from "../Requirement";

var idCounter = 0;

export class Actor {

    id = 0;
    imagePath: string = "/assets/images/actors/actor1.png";
    rarity: number = 0;
    name: string = "Hero";
    level: number = 1;
    loot: Item[] = [];
    dead: boolean = false;
    // todo attacks when interacted
    fights?: boolean = false;
    // shop: collection of items that can be bought opening the shop
    shop?: Item[] = [];
    // rest: can make you heal
    rest?: boolean = false;
    revive?: boolean = false;
    boss?: boolean = false;
    // equip: used in fights and, if not fighting, steal
    equipment: Equip[] = [];
    // an interaction can proc landing in the room, winning a fight against him or giving the neededItem and can make the npc vanish
    interactions: Interaction[] = [];
    dialogue: string[] = [''];
    clearanceDialogue: string[] = [''];
    // used to handle attack animations in fights
    attacked: boolean = false;
    // used to handle current turn animations in fights
    active: boolean = false;
    // deprecated
    //clearanceRequirements: Requirement[] = [];

    constructor() {
        this.id = idCounter++;
    }
}