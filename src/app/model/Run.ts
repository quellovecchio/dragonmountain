import { Character } from "./Character";
import { RunState } from "./RunState";
import { Stage } from "./Stage";

export class Run {
    player: Character;
    party: [];
    level: number;
    stage: Stage;
    time: number;               // TODO work with time data
    state: RunState;

    constructor() {
        this.player = new Character();
        this.party = [];
        this.level = 9;
        this.stage = new Stage();
        this.time = 0;
        this.state = RunState.Neutral;
    }

  }