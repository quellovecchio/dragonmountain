var idCounter = 0;

export class LocationDto {

    id: number = 0;
    name: string = "location";
    backgroundPath: string = "";
    // children locations for storyline
    children: number[] = [];
    fight: number[] = [];
    loot: number[] = [];
    actors: number[] = [];
    storylineCounter: number = 0.5; //default value

    constructor() {
        this.id = idCounter++;
    }
}