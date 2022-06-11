import { Stats } from "./Stats";

export class Character {
    name: string;
    level: number;
    experience: 0;
    stats: Stats;
    items: [];
    spells: [];

    constructor(name: string,
        level: number,
        experience: 0,
        stats: Stats,
        items: [],
        spells: []) {
            this.name = name;
            this.level = level;
            this.experience = experience;
            this.stats = stats;
            this.items = items;
            this.spells = spells;
        } 
}