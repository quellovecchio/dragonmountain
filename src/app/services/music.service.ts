import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class MusicService {

    currentlyPlaying: HTMLAudioElement = new Audio();

    constructor() { }

    stopMusic() {
        this.currentlyPlaying.pause();
        this.currentlyPlaying.src = '';
    }

    playSound(soundName: string) {
        let audio = new Audio();
        audio.src = "../../assets/sfx/" + soundName + ".mp3";
        audio.load();
        audio.volume = 0.2;
        audio.play();
    }

    loopSong(songName: string) {
        let audio = new Audio();
        audio.src = "../../assets/music/" + songName + ".mp3";
        audio.load();
        this.currentlyPlaying = audio;
        this.playSong(audio);

        audio.addEventListener('loadedmetadata', () => {
            setInterval(() => {
                audio.currentTime = 0;
                this.playSong(audio);
            }, audio.duration * 1000);
        });
    }

    playSong(audio: HTMLAudioElement) {
        audio.play();
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