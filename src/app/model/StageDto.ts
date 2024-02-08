import { LocationDto } from "./LocationDto";

var idCounter = 0;

export class StageDto {
    id: number = 0;
    name: string;
    backgroundPath: string;
    locations: number[];
    bossLocation: LocationDto;

    constructor () {
            this.id = idCounter++;
            this.name = "stage";
            this.locations =  [];
            this.backgroundPath = '';
            this.bossLocation = new LocationDto();
        }
}