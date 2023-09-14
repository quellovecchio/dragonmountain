import { Location } from "./Location";

export class Stage {
    name: string;
    locations: Location[];
    currentLocations: Location[];
    backgroundPath: string;
    bossLocation: Location;
    bossfightLocked: boolean = true;

    constructor () {
            this.name = "Damned Citadel";
            this.locations =  [];
            this.currentLocations =  [];
            this.backgroundPath = "/assets/images/stage1-bg.png";
            this.bossLocation = new Location();
        }
}