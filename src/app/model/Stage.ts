import { Location } from "./Location";

export class Stage {
    name: string;
    locations: Location[];
    backgroundPath: string;
    boss: string;                           // TODO to be a Enemy object

    constructor () {
            this.name = "Damned Citadel";
            this.locations =  [];
            this.backgroundPath = "/assets/images/stage1-bg.png";
            this.boss = "";
        }
}