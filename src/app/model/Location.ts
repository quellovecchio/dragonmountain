import { Character } from "./Character";
import { Item } from "./Item";

export class Location {
    name: string;
    backgroundPath: string;
    hasFight: boolean;
    loot: Item[];
    people: Character[];

    constructor() {
            this.name = "test_location";
            this.backgroundPath = "";
            this.hasFight = false;
            this.loot = [];
            this.loot.push(new Item());
            this.people = [];
        } 
    
    hasPeople() {
        return this.people.length > 0;
    }

    hasLoot() {
        return this.loot.length > 0;
    }
}