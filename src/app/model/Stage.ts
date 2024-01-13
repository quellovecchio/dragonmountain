import { Location } from "./Location";

var idCounter = 0;

export class Stage {
    id: number = 0;
    name: string;
    locations: Location[];
    currentLocations: Location[];
    backgroundPath: string;
    bossLocation: Location;
    bossfightLocked: boolean = true;

    constructor () {
            this.id = idCounter++;
            this.name = "stage";
            this.locations =  [];
            this.currentLocations =  [];
            this.backgroundPath = "/assets/images/stage1-bg.png";
            this.bossLocation = new Location();
        }
}