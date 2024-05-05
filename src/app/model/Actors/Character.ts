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
    fightPositionX: number = 0;
    fightPositionY: number = 0;
    actualAttackCooldown: number = 0;
    attackCooldown: number = 200;

    constructor() {
        super();
    }
}