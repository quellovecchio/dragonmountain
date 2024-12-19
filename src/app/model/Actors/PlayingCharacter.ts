import { Stats } from "../Stats";
import { Character } from "./Character";

export class PlayingCharacter extends Character {
    
    constructor(startingStats: Stats) {
        super();
        this.stats = startingStats;
    } 
}