import { Skill } from "../Skill";
import { Stats } from "../Stats";
import { Actor } from "./Actor";
import { Buff } from "../Buff";
import { Class } from "./Class";

export class Character extends Actor {

    stats: Stats = new Stats();
    joinsParty: boolean = false;
    classId: number = 0;
    class?: Class;
    // additional skills that are not from the class
    skills: Skill[] = [];

    /** Active buffs and debuffs currently affecting this character in battle. */
    activeBuffs: Buff[] = [];

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