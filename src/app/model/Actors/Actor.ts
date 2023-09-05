
import { Interaction } from "../Interaction";
import { Item } from "../Item";

export class Actor {

    imagePath: string = "/assets/images/actor1.png";
    name: string = "test_actor";
    level: number = 0;
    loot: Item[] = [];
    // todo gives item when interacted
    gives?: Item[] = [];
    // todo attacks when interacted
    fights?: boolean = false;
    // shop: collection of items that can be bought opening the shop
    shop?: Item[] = [];
    // rest: can make you heal
    rest?: boolean = false;
    // an interaction can proc landing in the room, winning a fight against him or giving the neededItem and can make the npc vanish
    interactions: Interaction[] = [];
    dialogue: string = '';

    constructor() {
    }
}