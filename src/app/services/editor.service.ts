import { Injectable } from '@angular/core';
import { Actor } from '../model/Actors/Actor';
import { Item } from '../model/items/Item';
import { Character } from '../model/Actors/Character';
import { Skill } from '../model/Skill';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  currentActors: Actor[] = [];
  currentItems: Item[] = [];
  currentSkills: Skill[] = [];

  constructor() { }

  getCurrentActors(): Actor[] {
    return this.currentActors;
  }

  saveCurrentActors(actors: Actor[]): void {
    this.currentActors = actors;
  }

  getCurrentItems(): Item[] {
    return this.currentItems;
  }

  saveCurrentItems(items: Item[]): void {
    this.currentItems = items;
  }

  getCurrentSkills(): Skill[] {
    return this.currentSkills;
  }

  getSkillById(id: number) : Skill {
    return this.currentSkills.filter((el: Skill) => el.id === id)[0];
  }

  saveCurrentSkills(skills: Skill[]): void {
    this.currentSkills = skills;
  }

  getCurrentEnemies(): Character[] {
    return [];
  }
}
