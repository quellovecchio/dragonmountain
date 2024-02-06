import { LocationDto } from "./LocationDto";

var idCounter = 0;

export class StageDto {
    id: number = 0;
    name: string;
    locations: LocationDto[];
    bossLocation: LocationDto;

    constructor () {
            this.id = idCounter++;
            this.name = "stage";
            this.locations =  [];
            this.bossLocation = new LocationDto();
        }
}