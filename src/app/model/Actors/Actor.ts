
import { Interaction } from "../Interaction";
import { Equip } from "../items/Equip";
import { Item } from "../items/Item";

export class Actor {

    imagePath: string = "/assets/images/actors/actor1.png";
    name: string = "Hero";
    level: number = 1;
    loot: Item[] = [];
    // todo gives item when interacted
    gives?: Item[] = [];
    // todo attacks when interacted
    fights?: boolean = false;
    // shop: collection of items that can be bought opening the shop
    shop?: Item[] = [];
    // rest: can make you heal
    rest?: boolean = false;
    // equip: used in fights and, if not fighting, steal
    equipment: Equip[] = [];
    // an interaction can proc landing in the room, winning a fight against him or giving the neededItem and can make the npc vanish
    interactions: Interaction[] = [];
    dialogue: string[] = [''];

    constructor() {
    }
}