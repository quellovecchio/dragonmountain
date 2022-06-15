import { Location } from "./Location";

export class Stage {
    name: string;
    locations: Location[];
    backgroundPath: string;
    boss: string;                           // TODO to be a Enemy object

    constructor () {
            this.name = "test_stage";
            this.locations =  [];
            this.backgroundPath = "https://www.collinsdictionary.com/images/full/hill_341357132_1000.jpg";
            this.boss = "";
        }
}