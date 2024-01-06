import { Injectable } from '@angular/core';
import { Run } from '../../model/Run';
import { Constants } from 'src/assets/constants';
import { Location } from "../../model/Location";
import { Class } from '../../model/Actors/Class';
import { Skill } from '../../model/Skill';
import { Item } from '../../model/items/Item';

@Injectable({
  providedIn: 'root'
})
export class RunService {

  run: Run = new Run();

  skills: Skill[] = [];
  items: Item[] = [];
  classes: Class[] = [];

  constructor() { }

  setRun(run: Run) {
    this.run = run;
  }

  setSkills(skills: Skill[]): void {
    this.skills = skills;
  }

  getSkillById(id: number): Skill | undefined {
    return this.skills.find(s => s.id === id);
  }

  setItems(items: Item[]): void {
    this.items = items;
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
}
