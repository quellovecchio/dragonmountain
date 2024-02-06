import { Actor } from "./Actors/Actor";
import { Character } from "./Actors/Character";
import { Item } from "./items/Item";

var idCounter = 0;

export class Location {

    id: number = 0;
    name: string = "location";
    backgroundPath: string = "";
    fight: Character[] = [];
    loot: Item[] = [];
    actors: Actor[] = [];
    bindedLocation?: Location[];

    constructor() {
        this.id = idCounter++;
    }
    
    hasActors() {
        if(!this.actors)
            return false;
        return this.actors.length > 0;
    }

    hasLoot() {
        return this.loot.length > 0;
    }
}