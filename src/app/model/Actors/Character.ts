import { Stats } from "../Stats";
import { Actor } from "./Actor";

export class Character extends Actor {
    
    stats: Stats = new Stats();
    spells: [] = [];

    constructor() {
        super();
    } 
}