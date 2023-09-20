export class Stats {

    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    healthPoints: number;
    magicPoints: number;

    constructor() {
        this.strength = 5;
        this.dexterity = 5;
        this.constitution = 20;
        this.intelligence = 5;
        this.wisdom = 5;
        this.charisma = 5;
        this.healthPoints = 20;
        this.magicPoints = 10;
    }

    getStatsToDisplay() {
        return [
            { name: "strength", value: this.strength },
            { name: "dexterity", value: this.dexterity },
            { name: "constitution", value: this.dexterity },
            { name: "intelligence", value: this.intelligence },
            { name: "wisdom", value: this.wisdom },
            { name: "charisma", value: this.charisma },
        ]
    }
}