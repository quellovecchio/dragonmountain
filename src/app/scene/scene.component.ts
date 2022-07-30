import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Run } from '../model/Run';
import { RunState } from '../model/RunState';
import { Location } from '../model/Location';
import { Character } from '../model/Actors/Character';
import { FightManagerService } from '../fight-manager.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit {

  @Input() run: Run;
  @Output() pushTextEvent = new EventEmitter<string>();

  fightManager: FightManagerService;
  
  constructor(fightManager: FightManagerService) {
    this.run = new Run();
    this.fightManager = fightManager;
   }

  ngOnInit(): void {
  }

  update(updatedRun: Run) {
    this.run = updatedRun;
  }


  // Location actions

  moveTo(location: Location) {
    this.run.currentLocation = location;
    setTimeout(() => { this.pushTextEvent.emit("The party has moved to the " + location.name + ".") }, 200 * this.run.textSpeed);
    if(location.hasFight()) {
      // start fight
      this.run.state = RunState.Fight;
      setTimeout(() => { this.pushTextEvent.emit("Enemies are attacking the party! " + location.name + ".") }, 1200 * this.run.textSpeed);
      this.fightManager.startFight(location.fight, this.run.party);
      setTimeout(() => { this.pushTextEvent.emit("Now it's " + this.fightManager.currentCharacter + "'s turn. What will be his next Action?" ) }, 2200 * this.run.textSpeed);
    } else {
      this.explore(location);
    }
  }

  private explore(location: Location) {
    if (location.hasLoot()) {
      // add loot to party inventory
      location.loot.forEach(el => {
        this.run.items.push(el);
        setTimeout(() => { this.pushTextEvent.emit("You found a " + el.name + "!"); }, 1200 * this.run.textSpeed);
        setTimeout(() => { this.pushTextEvent.emit("The item was placed into the inventory"); }, 2200 * this.run.textSpeed);
      });
    }
    if (location.hasActors()) {
      // people
      console.log("c");
    }
  }

  returnToMap(location: Location) {
    this.run.state = RunState.Exploration;
    this.run.currentLocation = undefined;
    if(location)
      setTimeout(() => { this.pushTextEvent.emit("The party is back from the " + location.name + ".") }, 200 * this.run.textSpeed);
    setTimeout(() => { this.pushTextEvent.emit("What's our next move?") }, 1200 * this.run.textSpeed);
  }

  interact(character: Character) {
    setTimeout(() => { this.pushTextEvent.emit("Interacted with " + character.name + ".") }, 200 * this.run.textSpeed);
  }

  // Fight actions

  attack(defendingCharacter: Character) {
    let damage = this.fightManager.processAttack(defendingCharacter);
    setTimeout(() => { this.pushTextEvent.emit(defendingCharacter.name + " gets " + damage + " points of damage!" ) }, 200 * this.run.textSpeed);
    if(this.fightManager.isBattleOver()) {
    this.fightManager.endFight();
    this.run.state = RunState.Location;
    setTimeout(() => { this.pushTextEvent.emit("The party has won the fight!") }, 1200 * this.run.textSpeed);
    // TODO experience calculation
    if (this.run.currentLocation)
      this.explore(this.run.currentLocation);
    }
    else {
      // check if number of enemies is the same as before, update enemies with the ones of the service and go on with the fight
    }
  }

  flee() {
    // TODO
  }

}
