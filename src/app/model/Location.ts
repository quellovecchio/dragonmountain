import { Actor } from "./Actors/Actor";
import { Character } from "./Actors/Character";
import { TestEnemy } from "./Actors/Test/TestEnemy";
import { Item } from "./Item";

export class Location {
    name: string = "test_location";
    backgroundPath: string = "";
    fight: Character[] = [ new TestEnemy ];
    loot: Item[] = [ new Item ];
    actors?: Actor[] = [ new Actor ];

    constructor() {
    } 
    
    hasActors() {
        if(!this.actors)
            return false;
        return this.actors.length > 0;
    }

    hasLoot() {
        return this.loot.length > 0;
    }

    hasFight() {
        return this.fight.length > 0;
    }
}