import { Time } from "@angular/common";
import { Character } from "./Character";
import { Stage } from "./Stage";

export class Run {
    player: Character;
    party: [];
    level: number;
    stage: Stage;
    time: Time;

    constructor (player: Character,
        party: [],
        level: number,
        stage: Stage,
        time: Time) {
            this.player = player;
            this.party =  party;
            this.level = level;
            this.stage = stage;
            this.time = time;
        }
  }