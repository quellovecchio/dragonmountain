var idCounter = 0;

export class StageDto {
    id: number = 0;
    name: string;
    backgroundPath: string;
    locations: number[];
    questlines: number[];

    constructor () {
            this.id = idCounter++;
            this.name = "stage";
            this.locations =  [];
            this.backgroundPath = '';
            this.questlines = [];
        }
}