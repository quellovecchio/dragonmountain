import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Run } from '../model/Run';
import { RunState } from '../model/RunState';
import { Location } from '../model/Location';
import { Character } from '../model/Actors/Character';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit {

  @Input() run: Run;
  @Output() pushTextEvent = new EventEmitter<string>();
  
  constructor() {
    this.run = new Run();
   }

  ngOnInit(): void {
  }

  update(updatedRun: Run) {
    this.run = updatedRun;
  }

  explore(location: Location) {
    this.run.currentLocation = location;
    setTimeout(() => { this.pushTextEvent.emit("The party has moved to the " + location.name + "."); this.run.state = RunState.Location }, 200 * this.run.textSpeed);
    if(location.hasFight) {
      // fight
      console.log("a");
    }
    if(location.hasLoot()) {
      // add loot to party inventory
      location.loot.forEach(el => {
        this.run.items.push(el);
        setTimeout(() => { this.pushTextEvent.emit("You found a " + el.name + "!"); }, 1200 * this.run.textSpeed);
        setTimeout(() => { this.pushTextEvent.emit("The item was placed into the inventory"); }, 2200 * this.run.textSpeed);
      });
    }
    if(location.hasActors()) {
      // people
      console.log("c");
    }
  }

  interact(character: Character) {
    setTimeout(() => { this.pushTextEvent.emit("Interacted with " + character.name + "."); this.run.state = RunState.Location }, 200 * this.run.textSpeed);
  }

}
