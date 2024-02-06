var idCounter = 0;

export class LocationDto {

    id: number = 0;
    name: string = "location";
    backgroundPath: string = "";
    fight: number[] = [];
    loot: number[] = [];
    actors: number[] = [];

    constructor() {
        this.id = idCounter++;
    }
}