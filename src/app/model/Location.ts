import { Actor } from "./Actors/Actor";
import { Item } from "./Item";

export class Location {
    name: string = "test_location";
    backgroundPath: string = "";
    hasFight: boolean = false;
    loot: Item[] = [];
    actors: Actor[] = [];

    constructor() {
    } 
    
    hasActors() {
        return this.actors.length > 0;
    }

    hasLoot() {
        return this.loot.length > 0;
    }
}