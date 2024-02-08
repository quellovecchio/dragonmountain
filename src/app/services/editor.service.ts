import { Injectable } from '@angular/core';
import { Actor } from '../model/Actors/Actor';
import { Item } from '../model/items/Item';
import { Skill } from '../model/Skill';
import { RunService } from './run.service';
import { Class } from '../model/Actors/Class';
import { StageDto } from '../model/StageDto';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  currentActors: Actor[] = [];
  currentItems: Item[] = [];
  currentSkills: Skill[] = [];
  currentClasses: Class[] = [];

  constructor(private runService: RunService) { }

  reset() {
    this.currentActors = [];
    this.currentItems = [];
    this.currentSkills = [];
    this.currentClasses = [];
  }

  loadFromFile(data: any) {
    this.currentItems = data.items;
    this.currentSkills = data.skills;
    this.currentClasses = data.classes;
    this.runService.setRun(data);
    this.runService.setItems(data.items);
    this.runService.setActors(data.actors);
    this.runService.setSkills(data.skills);
    this.runService.setClasses(data.classes);
    this.currentActors = this.runService.populateActors(data.actors);
    // TODO reorganize data to have location as a new slot of data and locations in stages only list of ids
    //this.currentLocations = this.runService.populateLocations
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

  getCurrentClasses(): Class[] {
    return this.currentClasses;
  }

  getClassById(id: number) : Class {
    return this.currentClasses.filter((el: Class) => el.id === id)[0];
  }

  saveCurrentClasses(classes: Class[]): void {
    this.currentClasses = classes;
  }
}
