import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class MusicService {
    constructor() { }

    loopSong(songName: string) {
        let audio = new Audio();
        audio.src = "../../assets/music/" + songName + ".mp3";
        audio.load();
        audio.play();

        audio.addEventListener('loadedmetadata', () => {
            setInterval(() => {
                audio.currentTime = 0;
                audio.play();
            }, audio.duration * 1000);
        });
    }
}