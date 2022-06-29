export class Action {

    name: string = "test_action";

    constructor() {
    } 

    fire() {
        console.log("fired generic action")
    }
}