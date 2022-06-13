export class Stage {
    name: string;
    locations: [];
    backgroundPath: string;
    boss: string;                           // TODO to be a Enemy object

    constructor () {
            this.name = "test_stage";
            this.locations =  [];
            this.backgroundPath = "";
            this.boss = "";
        }
}