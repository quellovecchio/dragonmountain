import { Constants } from "src/assets/constants";

export class Settings {
    textSpeed: number = Constants.TEXT_SPEED;
    fightSpeed: number = Constants.FIGHT_CLOCK_SPEED;
    musicVolume: number = Constants.MUSIC_VOLUME;
    fxVolume: number = Constants.SOUND_VOLUME;

    constructor () {
        }
}