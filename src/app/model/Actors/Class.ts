var idCounter = 0;

export class Class {

    id: number = 0;
    name: string = 'class';
    skillTree: {skillId: number, unlockLevel: string, unlockStat: string}[] = [];

    constructor() {
        this.id = idCounter++;
    }
}