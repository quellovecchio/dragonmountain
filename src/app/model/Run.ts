import { Time } from "@angular/common";
import { Character } from "./Character";
import { Stage } from "./Stage";

export class Run {
    player: Character;
    party: [];
    level: number;
    stage: Stage;
    time: number;               // TODO work with time data

    constructor() {
        this.player = new Character();
        this.party = [];
        this.level = 0;
        this.stage = new Stage();
        this.time = 0;
    }
  }