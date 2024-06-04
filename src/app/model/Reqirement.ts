export class Requirement {

    // can be 'actor-dead', 'talk', 'interacted-with', 'choise-made'
    type: string = '';
    // present if 'actor-dead', 'interacted-with', 'choise-made'
    // in each case it represents the actor fighted, the item you need to present or the choise made at some point
    additionalInfo: any = ''; 

    constructor(type: string, additionalInfo: any) {
        this.type = type;
        this.additionalInfo = additionalInfo;
    }
}