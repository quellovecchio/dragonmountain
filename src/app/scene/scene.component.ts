import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Run } from '../model/Run';
import { RunState } from '../model/RunState';
import { Location } from '../model/Location';
import { Character } from '../model/Actors/Character';
import { FightManagerService } from '../fight-manager.service';
import { Actor } from '../model/Actors/Actor';
import { find, findIndex } from 'rxjs';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit {

  @Input() run: Run;
  @Output() pushTextEvent = new EventEmitter<string>();
  ready: boolean = false;

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
    if(location.fight.length > 0) {
      // start fight
      setTimeout(() => { this.pushTextEvent.emit("Enemies are attacking the party! " + location.name + "."); }, 1200 * this.run.textSpeed);
      this.startFight(location.fight);
    } else {
      this.explore(location);
    }
  }

  private explore(location: Location) {
    // change background to location background
    
    if (location.loot.length > 0) {
      // add loot to party inventory
      location.loot.forEach(el => {
        this.run.items.push(el);
        setTimeout(() => { this.pushTextEvent.emit("You found a " + el.name + "!"); }, 1200 * this.run.textSpeed);
        setTimeout(() => { this.pushTextEvent.emit("The item was placed into the inventory"); }, 2200 * this.run.textSpeed);
      });
      location.loot = [];
    }
    if (location.actors && location.actors?.length > 0) {
      this.run.state = RunState.Location;
    }
  }

  returnToMap(location: Location) {
    this.run.state = RunState.Exploration;
    this.run.currentLocation = undefined;
    if(location) {
      setTimeout(() => { this.pushTextEvent.emit("The party is back from the " + location.name + ".") }, 200 * this.run.textSpeed);
      setTimeout(() => { this.pushTextEvent.emit("What's our next move?") }, 1200 * this.run.textSpeed);
    }
  }

  interact(character: Character) {
    console.log(this.run.currentLocation?.actors)
    setTimeout(() => { this.pushTextEvent.emit("Interacted with " + character.name + ".") }, 200 * this.run.textSpeed);
  }

  // Fight

  private startFight(fight: Character[]) {
    this.run.state = RunState.Fight;
    this.fightManager.startFight(fight, this.run.party);
    setTimeout(() => { this.pushTextEvent.emit("Now it's " + this.fightManager.currentCharacter.name + "'s turn. What will be his next Action?"); }, 2200 * this.run.textSpeed);
  }

  attack(defendingCharacter: Character) {
    let damage = this.fightManager.processAttack(defendingCharacter);
    setTimeout(() => { this.pushTextEvent.emit(defendingCharacter.name + " gets " + damage + " points of damage!" ) }, 200 * this.run.textSpeed);
    if(this.fightManager.isBattleOver()) {
    this.fightManager.endFight();
    if(this.run.currentLocation)
      this.run.currentLocation.fight = [];
      let deadActorIndex = this.run.currentLocation?.actors?.findIndex(c => { return c.name === defendingCharacter.name });
      if (this.run.currentLocation && this.run.currentLocation.actors && deadActorIndex && deadActorIndex > -1) {
        this.run.currentLocation.actors.splice(deadActorIndex, 1);
      }
    this.run.state = RunState.Location;
    setTimeout(() => { this.pushTextEvent.emit("The party has won the fight!") }, 1200 * this.run.textSpeed);
    // TODO experience calculation
    if (this.run.currentLocation)
      this.explore(this.run.currentLocation);
    }
  }

  flee() {
    // TODO
  }

  // NPC interactions

  talkToActor(a: Actor) {
    console.log(this.run.currentLocation?.actors)
    setTimeout(() => { this.pushTextEvent.emit(a.name + ": " + a.dialogue) }, 200 * this.run.textSpeed);
  }

  engageFightWith(a: Actor) {
    console.log(this.run.currentLocation?.actors)
    setTimeout(() => { this.pushTextEvent.emit("You engaged combat with " + a.name + "."); }, 200 * this.run.textSpeed);
      this.startFight([a as Character]);
  }

  getBackgroundImage() {
    if(this.run.state == RunState.Exploration)
      return this.run.stage.backgroundPath;
    if(this.run.state == RunState.Fight || this.run.state == RunState.Location)
      return this.run.currentLocation?.backgroundPath;
    return "/assets/images/splash_art.png";
  }

}
