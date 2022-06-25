import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Run } from '../model/Run';
import { RunState } from '../model/RunState';
import { Location } from '../model/Location';

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
    this.run.state = RunState.Location;
    this.run.currentLocation = location;
    this.pushTextEvent.emit("The party has moved to the " + location.name + ".");
    if(location.hasFight) {
      // fight
      console.log("a");
    }
    if(location.hasLoot) {
      // loot
      console.log("b");
    }
    if(location.hasPeople()) {
      // people
      console.log("c");
    }
  }

}
