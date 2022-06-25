import { Stats } from "./Stats";

export class Character {
    name: string;
    level: number;
    experience: 0;
    stats: Stats;
    spells: [];

    constructor() {
            this.name = "test_character";
            this.level = 0;
            this.experience = 0;
            this.stats = new Stats();
            this.spells = [];
        } 
}