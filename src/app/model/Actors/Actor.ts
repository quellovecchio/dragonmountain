import { Action } from "../Action";
import { Item } from "../Item";

export class Actor {

    name: string = "test_actor";
    level: number = 0;
    loot: Item[] = [];
    // todo creare Effect item
    // an effect can proc landing in the room, winning a fight against him or giving the neededItem and can make the npc vanish
    effects: [] = [];
    // needed item to proc an effect
    neededItem: Item = new Item();
    dialogue: string = '';

    constructor() {
    }
}