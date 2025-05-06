var idCounter = 0;

export class Class {

    id: number = 0;
    name: string = 'class';
    skillTree: {skillId: number, unlockLevel: number, unlockStat: string}[] = [];
    // range of the basic attack: 0 is meelee only
    attackRange: number = 0;

    constructor() {
        this.id = idCounter++;
    }
}