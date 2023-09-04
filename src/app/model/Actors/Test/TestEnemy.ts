import { Stats } from "../../Stats";
import { Character } from "../Character";

export class TestEnemy extends Character {

    constructor() {
        super();
        this.name = "giusy"
        this.stats = new TestStats();
    } 
}

export class TestStats extends Stats {
    
    constructor() {
        super();
        this.charisma = 1;
        this.strength = 1;
        this.constitution = 1;
        this.dexterity = 1;
        this.intelligence = 1;
        this.healthPoints = 20;
    } 
}