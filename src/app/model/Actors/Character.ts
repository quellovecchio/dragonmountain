import { Skill } from "../Skill";
import { Stats } from "../Stats";
import { Actor } from "./Actor";
import { Class } from "./Class";

export class Character extends Actor {

    stats: Stats = new Stats();
    joinsParty: boolean = false;
    classId: number = 0;
    class?: Class;
    skills: Skill[] = [];

    constructor() {
        super();
    }
}