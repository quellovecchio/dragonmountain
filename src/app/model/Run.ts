import { Character } from "./Actors/Character";
import { PlayingCharacter } from "./Actors/PlayingCharacter";
import { Item } from "./items/Item";
import { Location } from "./Location";
import { RunState } from "./RunState";
import { Stage } from "./Stage";

export class Run {
    party: PlayingCharacter[] = [ new PlayingCharacter ];
    inventory: { items: Item[], money: number } = { items: [], money: 1500 };
    level: number = 1;
    stage: Stage = new Stage();
    time: number = 0;               // TODO work with time data
    state: RunState = RunState.Neutral;
    currentLocation?: Location;
    currentFight?: Character[];
    experience: number = 5;
    showBossfightLocation: boolean = false;

    constructor() {
    }

  }