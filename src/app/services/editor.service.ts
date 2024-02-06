import { Injectable } from '@angular/core';
import { Actor } from '../model/Actors/Actor';
import { Item } from '../model/items/Item';
import { Character } from '../model/Actors/Character';
import { Skill } from '../model/Skill';
import { RunService } from './run.service';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  currentActors: Actor[] = [];
  currentItems: Item[] = [];
  currentSkills: Skill[] = [];

  constructor(private runService: RunService) { }

  reset() {
    this.currentActors = [];
    this.currentItems = [];
    this.currentSkills = [];
  }

  loadFromFile(data: any) {
    /*this.runService.setRun(data);
    this.runService.setItems(data.items);
    this.runService.setActors(data.actors);
    this.runService.setSkills(data.skills);
    this.runService.setClasses(data.classes);
    this.currentActors = this.runService.populateActors(data.stages[0].locations);*/
    this.currentItems = data.items;
  }

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
