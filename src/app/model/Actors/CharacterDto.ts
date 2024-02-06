import { Stats } from "../Stats";
import { ActorDto } from "./ActorDto";

export class CharacterDto extends ActorDto {

    stats: Stats = new Stats();
    joinsParty: boolean = false;
    classId: number = 0;
    skills: number[] = [];

    constructor() {
        super();
    }
}