import { Character } from "./Actors/Character";
import { Item } from "./Item";
import { Location } from "./Location";
import { RunState } from "./RunState";
import { Stage } from "./Stage";

export class Run {
    player: Character;
    party: [];
    items: Item[];
    level: number;
    stage: Stage;
    time: number;               // TODO work with time data
    state: RunState;
    currentLocation: Location;

    // options
    textSpeed: number = 0.1;

    constructor() {
        this.player = new Character();
        this.party = [];
        this.items = [];
        this.level = 9;
        this.stage = new Stage();
        this.time = 0;
        this.state = RunState.Neutral;
        this.currentLocation = new Location();
    }

  }