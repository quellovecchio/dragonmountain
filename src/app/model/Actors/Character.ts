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
    dead: boolean = false;

    // battle purpose variables
    fightPositionX: number = 0;
    fightPositionY: number = 0;
    actualAttackCooldown: number = 0;
    attackCooldown: number = 1000;
    damaged: boolean = false;

    constructor() {
        super();
    }
}