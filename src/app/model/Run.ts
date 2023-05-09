import { Character } from "./Actors/Character";
import { PlayingCharacter } from "./Actors/PlayingCharacter";
import { Item } from "./Item";
import { Location } from "./Location";
import { RunState } from "./RunState";
import { Stage } from "./Stage";

export class Run {
    party: PlayingCharacter[] = [ new PlayingCharacter ];
    items: Item[] = [];
    level: number = 9;
    stage: Stage = new Stage();
    time: number = 0;               // TODO work with time data
    state: RunState = RunState.Neutral;
    currentLocation?: Location;
    currentFight?: Character[];

    // options
    textSpeed: number = 0.1;
    //textSpeed: number = 1;

    constructor() {
    }

  }