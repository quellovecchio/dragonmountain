import { Injectable } from '@angular/core';
import { Actor } from '../model/Actors/Actor';
import { Item } from '../model/items/Item';
import { Skill } from '../model/Skill';
import { RunService } from './run.service';
import { Class } from '../model/Actors/Class';
import { Location } from '../model/Location';
import { Stage } from '../model/Stage';
import { StageDto } from '../model/StageDto';
import { LocationDto } from '../model/LocationDto';
import { ActorDto } from '../model/Actors/ActorDto';
import { Character } from '../model/Actors/Character';

@Injectable({
  providedIn: 'root'
})
export class EditorService {

  currentActors: Actor[] = [];
  currentItems: Item[] = [];
  currentSkills: Skill[] = [];
  currentClasses: Class[] = [];
  currentLocations: Location[] = [];
  currentStages: Stage[] = [];

  constructor(private runService: RunService) { }

  reset() {
    this.currentActors = [];
    this.currentItems = [];
    this.currentSkills = [];
    this.currentClasses = [];
    this.currentLocations = [];
    this.currentStages = [];
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
    this.currentLocations = this.runService.populateLocations(data.locations);
    this.currentStages = this.runService.populateStages(data.stages, data.locations);
  }

  getCurrentActors(): Actor[] {
    return this.currentActors;
  }

  saveCurrentActors(actors: Actor[]): void {
    this.currentActors = actors;
  }

  exportActors(): ActorDto[] {
    let r: ActorDto[] = [];
    this.currentActors.forEach((el: Actor) => {
      let dto = new ActorDto();
      dto.id = el.id ? el.id : 0
      dto.name = el.name ? el.name : 'error';
      dto.imagePath = el.imagePath ? el.imagePath : 'error';
      dto.dialogue = el.dialogue ? el.dialogue : [];
      dto.interactions = el.interactions ? el.interactions : [];
      dto.rest = el.rest ? el.rest : false;
      dto.shop = el.shop ? el.shop.map((el: Item) => el.id) : [];
      dto.equipment = el.equipment ? el.equipment.map((el: Item) => el.id) : [];
      dto.loot = el.loot.map((el: Item) => el.id);
      r.push(dto);
    });
    return r;
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

  getCurrentLocations(): Location[] {
    return this.currentLocations;
  }

  getLocationById(id: number) : Location {
    return this.currentLocations.filter((el: Location) => el.id === id)[0];
  }

  saveCurrentLocations(locations: Location[]): void {
    this.currentLocations = locations;
  }

  exportLocations(): LocationDto[] {
    let r: LocationDto[] = [];
    this.currentLocations.forEach((el: Location) => {
      let dto = new LocationDto();
      dto.id = el.id;
      dto.name = el.name;
      dto.backgroundPath = el.backgroundPath;
      dto.fight = el.fight.map((el: Actor) => el.id);
      dto.actors = el.actors.map((el: Actor) => el.id);
      dto.loot = el.loot.map((el: Item) => el.id);
      r.push(dto);
    });
    return r;
  }

  getCurrentStages(): Stage[] {
    return this.currentStages;
  }

  getStageById(id: number) : Stage {
    return this.currentStages.filter((el: Stage) => el.id === id)[0];
  }

  saveCurrentStages(stages: Stage[]): void {
    this.currentStages = stages;
  }

  exportStages(): StageDto[] {
    let r: StageDto[] = [];
    this.currentStages.forEach((el: Stage) => {
      let dto = new StageDto();
      dto.id = el.id;
      dto.name = el.name;
      dto.backgroundPath = el.backgroundPath;
      dto.locations = el.locations.map((el: Location) => el.id);
      dto.bossLocation = el.bossLocation.id;
      r.push(dto);
    });
    return r;
  }
}
