import { Time } from "@angular/common";
import { Character } from "./Character";
import { Stage } from "./Stage";

export class Run {
    player: Character;
    party: [];
    level: number;
    stage: Stage;
    time: number;               // TODO work with time data

    /*constructor (player: Character,
        party: [],
        level: number,
        stage: Stage,
        time: number) {
            this.player = player;
            this.party =  party;
            this.level = level;
            this.stage = stage;
            this.time = time;
        }*/
    constructor() {
        this.player = new Character();
        this.party = [];
        this.level = 9;
        this.stage = new Stage();
        this.time = 0;
    }
  }