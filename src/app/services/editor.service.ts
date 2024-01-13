import { Injectable } from '@angular/core';
import { Actor } from '../model/Actors/Actor';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  currentActors: Actor[] = [];

  constructor() { }

  getCurrentActors(): Actor[] {
    return this.currentActors;
  }

  saveCurrentActors(actors: Actor[]): void {
    this.currentActors = actors;
  }
}
