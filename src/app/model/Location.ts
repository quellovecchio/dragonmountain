export class Location {
    name: string;
    backgroundPath: string;
    hasFight: boolean;
    hasLoot: boolean;
    people: [];

    constructor() {
            this.name = "test_location";
            this.backgroundPath = "";
            this.hasFight = false;
            this.hasLoot = true;
            this.people = [];
        } 
    
    hasPeople() {
        return this.people.length == 0;
    }
}