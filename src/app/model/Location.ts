import { Actor } from "./Actors/Actor";
import { Character } from "./Actors/Character";
import { Item } from "./items/Item";
import { Rarity } from "./common/Rarity";

var idCounter = 0;

export class Location {

    id: number = 0;
    name: string = "location";
    backgroundPath: string = "";
    // children location ids for storyline
    children: number[] = [];
    fight: Character[] = [];
    loot: Item[] = [];
    actors: Actor[] = [];
    bindedLocation?: Location[];
    storylineCounter: number = 0.5; //default value
    rarity: Rarity = 'common';
    description?: string;
    tags?: string[];

    constructor() {
        this.id = idCounter++;
    }

    hasActors() {
        if (!this.actors)
            return false;
        return this.actors.length > 0;
    }

    hasLoot() {
        return this.loot.length > 0;
    }
}