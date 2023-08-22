import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Run } from '../model/Run';
import { RunState } from '../model/RunState';
import { Location } from '../model/Location';
import { Character } from '../model/Actors/Character';
import { FightManagerService } from '../fight-manager.service';
import { Actor } from '../model/Actors/Actor';
import { find, findIndex } from 'rxjs';
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';
import { Item } from '../model/Item';
import { EffectType, Interaction } from '../model/Interaction';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit {

  @Input() run: Run;
  @Input() selectedItem?: Item = undefined;
  @Output() pushTextEvent = new EventEmitter<string>();
  @Output() joinsPartyEvent = new EventEmitter<any>();
  @Output() interactionEndSignal = new EventEmitter<any>();
  @Output() itemBoughtSignal = new EventEmitter<Item>();
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
    setTimeout(() => { this.pushTextEvent.emit("The party has moved to " + location.name + ".") }, 200 * this.run.textSpeed);
    if(location.fight && location.fight.length > 0) {
      // start fight
      setTimeout(() => { this.pushTextEvent.emit("Enemies are attacking the party! " + location.name + "."); }, 1200 * this.run.textSpeed);
      this.startFight(location.fight);
    } else {
      this.explore(location);
    }
  }

  private explore(location: Location) {
    // change background to location background
    
    if (location.loot && location.loot.length > 0) {
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

  interact(data: {character: Character; action: any}) {
    // If the character reacts to the interaction, activate the specified effect
    if(data.character.interactions? data.character.interactions.filter((interaction: Interaction) => interaction.reactTo == data.action.name).length > 0 : false) {
      let interaction = data.character.interactions.filter((interaction: Interaction) => interaction.reactTo == data.action.name)[0];
      if(interaction.effect == EffectType.fight) {
        setTimeout(() => { this.pushTextEvent.emit(interaction.text); }, 1200 * this.run.textSpeed);
        this.startFight(interaction.effectTarget);
      }
      if(interaction.effect == EffectType.giveItem) {
        interaction.effectTarget.forEach((el: Item) => {
          this.run.items.push(el);
          setTimeout(() => { this.pushTextEvent.emit(data.character.name + " gave you a " + el.name + "!"); }, 1200 * this.run.textSpeed);
          setTimeout(() => { this.pushTextEvent.emit("The item was placed into the inventory"); }, 2200 * this.run.textSpeed);
        });
      }
    }
    // If it does not react to the interaction, activate the standard effect of the object
    else if(data.action.effect) {
      console.log("reacted with sandard interaction");
    }
    // If the object has no effect, send an error message
    else {
      setTimeout(() => { this.pushTextEvent.emit("Using " + data.action.name + " on " + data.character.name + " had no effect...") }, 200 * this.run.textSpeed);
    }
    this.selectedItem = undefined;
    this.interactionEndSignal.emit();
  }

  buy(item: any) {
    // TODO: check money, if not enough error message
    // TODO: dialog yES/NO are ou sure?
    // TODO: remove money from your Inventory
    // finally, add item to inventory
    //this.itemBoughtSignal.emit(item);
    console.log("bu ok")
    this.run.items.push(item);
  }

  // Fight

  private startFight(fight: Character[]) {
    this.run.state = RunState.Fight;
    this.fightManager.startFight(fight, this.run.party);
    setTimeout(() => { this.pushTextEvent.emit("Now it's " + this.fightManager.currentCharacter.name + "'s turn. What will be his next Action?"); }, 2200 * this.run.textSpeed);
  }

  attack(enemyIndex: number) {
    let defendingCharacter = this.fightManager.getEnemy(enemyIndex);
    let damage = this.fightManager.processAttack(enemyIndex);
    setTimeout(() => { this.pushTextEvent.emit(defendingCharacter.name + " gets " + damage + " points of damage!" ) }, 200 * this.run.textSpeed);
    if(this.fightManager.isBattleOver()) {
      this.endFight(defendingCharacter);
    }
  }

  private endFight(defendingCharacter: Character) {
    var joins = false;
    this.fightManager.endFight();
    if (this.run.currentLocation)
      this.run.currentLocation.fight = [];
    let deadActorIndex = this.run.currentLocation?.actors?.findIndex(c => { return c.name === defendingCharacter.name; });
    if(this.run.currentLocation && this.run.currentLocation?.actors && deadActorIndex) {
      var deadActor = this.run.currentLocation?.actors[deadActorIndex] as PlayingCharacter;
      if(deadActor && deadActor.joinsParty)
        joins = true;
    }
    if (this.run.currentLocation && this.run.currentLocation.actors && deadActorIndex && deadActorIndex > -1) {
      this.run.currentLocation.actors.splice(deadActorIndex, 1);
    }
    this.run.state = RunState.Location;
    setTimeout(() => { this.pushTextEvent.emit("The party has won the fight!"); }, 1200 * this.run.textSpeed);
    // TODO experience calculation
    if(joins) {
      this.joinsPartyEvent.emit(deadActor!);
      setTimeout(() => { this.pushTextEvent.emit(deadActor.name + " decided to join your party!"); }, 2200 * this.run.textSpeed);
      if (this.run.currentLocation)
        this.explore(this.run.currentLocation);
    } else {
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
