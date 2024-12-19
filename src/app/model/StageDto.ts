import { QuestlineTreeDto } from "./QuestlineTreeDto";

var idCounter = 0;

export class StageDto {
    id: number = 0;
    name: string;
    backgroundPath: string;
    locations: number[];
    questlines: QuestlineTreeDto[];
    bossLocation: number;

    constructor () {
            this.id = idCounter++;
            this.name = "stage";
            this.locations =  [];
            this.backgroundPath = '';
            this.bossLocation = 0;
            this.questlines = [];
        }
}