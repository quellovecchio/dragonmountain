import { Injectable } from '@angular/core';
import { Run } from '../model/Run';
import { Constants } from 'src/assets/constants';
import { Location } from "../model/Location";
import { Class } from '../model/Actors/Class';
import { Skill } from '../model/Skill';
import { Item } from '../model/items/Item';
import { Actor } from '../model/Actors/Actor';
import { LocationDto } from '../model/LocationDto';
import { ActorDto } from '../model/Actors/ActorDto';
import { Equip } from '../model/items/Equip';
import { Character } from '../model/Actors/Character';
import { CharacterDto } from '../model/Actors/CharacterDto';

@Injectable({
  providedIn: 'root'
})
export class RunService {

  run: Run = new Run();

  skills: Skill[] = [];
  items: Item[] = [];
  actors: ActorDto[] = [];
  classes: Class[] = [];

  constructor() { }

  setRun(run: Run) {
    this.run = run;
  }

  setSkills(skills: Skill[]): void {
    this.skills = skills;
  }

  getSkillById(id: number): Skill {
    var r = this.skills.find(s => s.id === id);
    return r ? r : new Skill();
  }

  setItems(items: Item[]): void {
    this.items = items;
  }

  getItemById(id: number): Item {
    var r = this.items.find(i => i.id === id);
    return r ? r : new Item();
  }

  setActors(actors: ActorDto[]): void {
    this.actors = actors;
  }

  getActorById(id: number): ActorDto {
    var r = this.actors.find(a => a.id === id);
    return r ? r : new ActorDto();
  }

  setClasses(classes: Class[]): void {
    this.classes = classes;
  }

  getClassById(id: number): Class | undefined {
    return this.classes.find(c => c.id === id);
  }

  getRefreshedLocations() {
    var count = Constants.MAX_STAGE_ELEMENTS;
    if (count >= this.run.stage.locations.length) {
      // If count is greater than or equal to the list length, return the entire list
      const result = this.run.stage.locations.slice();
      this.run.stage.locations.length = 0; // Clear the original list
      return result;
    }
  
    const result: Location[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * this.run.stage.locations.length);
      result.push(this.run.stage.locations[randomIndex]);
      this.run.stage.locations.splice(randomIndex, 1); // Remove the selected element from the list
    }
  
    return result;
  }

  populateActors(dtos: ActorDto[]): Actor[] {
    var r: Actor[] = [];
    dtos.forEach(dto => {
      r.push(this.populateActor(dto.id))
    })
    return r;
  }

  populateActor(id: number): Actor {
    var r = new Actor();
    var actorData = this.getActorById(id);
    r.id = actorData.id;
    r.name = actorData.name;
    r.imagePath = actorData.imagePath;
    if(actorData.loot) {
      actorData.loot.forEach(id => {
        r.loot.push(this.getItemById(id))
      })
    }
    if(actorData.shop) {
      r.shop = [];
      actorData.shop.forEach(id => {
        r.shop!.push(this.getItemById(id))
      })
    }
    if(actorData.rest) {
      r.rest = actorData.rest;
    }
    if(actorData.equipment) {
      actorData.equipment.forEach(id => {
        r.equipment.push(this.getItemById(id) as Equip)
      })
    }
    if(actorData.interactions) {
      r.interactions = actorData.interactions;
    }
    if(actorData.dialogue) {
      r.dialogue = actorData.dialogue;
    }
    return r;
  }

  populateCharacter(id: number): Character {
    var r = new Character();
    var actorData = (this.getActorById(id) as CharacterDto);
    r.id = actorData.id;
    r.name = actorData.name;
    r.imagePath = actorData.imagePath;
    if(actorData.loot) {
      actorData.loot.forEach(id => {
        r.loot.push(this.getItemById(id))
      })
    }
    if(actorData.shop) {
      r.shop = [];
      actorData.shop.forEach(id => {
        r.shop!.push(this.getItemById(id))
      })
    }
    if(actorData.rest) {
      r.rest = actorData.rest;
    }
    if(actorData.equipment) {
      actorData.equipment.forEach(id => {
        r.equipment.push(this.getItemById(id) as Equip)
      })
    }
    if(actorData.interactions) {
      r.interactions = actorData.interactions;
    }
    if(actorData.dialogue) {
      r.dialogue = actorData.dialogue;
    }
    if(actorData.stats) {
      r.stats = actorData.stats;
    }
    if(actorData.joinsParty) {
      r.joinsParty = actorData.joinsParty;
    }
    if(actorData.classId) {
      r.class = this.getClassById(actorData.classId);
    }
    if(actorData.skills) {
      r.skills = [];
      actorData.skills.forEach(id => {
        r.skills!.push(this.getSkillById(id))
      })
    }
    return r;
  }

  populateLocation(dto: LocationDto): Location {
    var r = new Location();
    r.id = dto.id;
    r.name = dto.name;
    r.backgroundPath = dto.backgroundPath;
    if(dto.fight) {
      dto.fight.forEach(id => {
        r.fight.push(this.populateCharacter(id))
      })
    }
    if(dto.loot) {
      dto.loot.forEach(id => {
        r.loot.push(this.getItemById(id))
      })
    }
    if(dto.actors) {
      dto.actors.forEach(id => {
        r.actors.push(this.populateActor(id))
      })
    }
    return r;
  }

  populateLocations(dtos: LocationDto[]): Location[] {
    var r: Location[] = [];
    dtos.forEach(dto => {
      r.push(this.populateLocation(dto))
    })
    return r;
  }
}
