import { Injectable } from "@angular/core";
import { DataService } from "../data.service";

@Injectable({
    providedIn: 'root'
})
export class MusicService {

    currentlyPlaying: HTMLAudioElement = new Audio();
    loopInterval: any;

    constructor(private dataService: DataService) { }

    stopMusic() {
        this.currentlyPlaying.pause();
        this.currentlyPlaying.src = '';
        this.currentlyPlaying.removeEventListener('loadedmetadata', () => { });
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
    }

    playSound(soundName: string, volume?: number) {
        let audio = new Audio();
        audio.src = "../../assets/sfx/" + soundName + ".mp3";
        audio.load();
        if (volume) {
            audio.volume = volume;
        } else {
            audio.volume = this.dataService.getSettings().fxVolume;
        }
        audio.play();
    }

    loopSong(songName: string) {
        let audio = new Audio();
        audio.src = "../../assets/music/" + songName + ".mp3";
        audio.load();
        this.currentlyPlaying = audio;
        this.playSong(this.currentlyPlaying);

        this.currentlyPlaying.addEventListener('loadedmetadata', () => {
            this.loopInterval = setInterval(() => {
                audio.currentTime = 0;
            }, audio.duration * 1000);
        });
    }

    playSong(audio: HTMLAudioElement) {
        audio.play();
        audio.volume = this.dataService.getSettings().musicVolume;
        this.fadeIn(audio, 2000);
    }

    fadeIn(audio: HTMLAudioElement, duration: number) {
        let volume = 0;
        audio.volume = volume;
        const step = 0.01;
        const interval = duration / (1 / step);

        const fadeInInterval = setInterval(() => {
            if (volume < 1) {
                volume += step;
                audio.volume = volume;
            } else {
                clearInterval(fadeInInterval);
            }
        }, interval);
    }

    fadeOut(audio: HTMLAudioElement, duration: number) {
        let volume = audio.volume;
        const step = 0.01;
        const interval = duration / (1 / step);

        const fadeOutInterval = setInterval(() => {
            if (volume > 0) {
                volume -= step;
                audio.volume = volume;
            } else {
                clearInterval(fadeOutInterval);
                audio.pause();
            }
        }, interval);
    }
}