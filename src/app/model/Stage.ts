export class Stage {
    name: string;
    locations: [];
    backgroundPath: string;
    boss: string;                           // TODO to be a Enemy object

    constructor (name: string,
        locations: [],
        backgroundPath: string,
        boss: string) {
            this.name = name;
            this.locations =  locations;
            this.backgroundPath = backgroundPath;
            this.boss = boss;
        }
}