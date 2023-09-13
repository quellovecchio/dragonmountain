import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Run } from '../model/Run';
import { RunState } from '../model/RunState';
import { Location } from '../model/Location';
import { Character } from '../model/Actors/Character';
import { FightManagerService } from '../fight-manager.service';
import { Actor } from '../model/Actors/Actor';
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';
import { Item } from '../model/Item';
import { EffectType, Interaction } from '../model/Interaction';
import { animate, style, transition, trigger } from '@angular/animations';
import { RunService } from '../run.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, width: 0, top: 0 }),
            animate('0.2s ease-out',
              style({ height: 500, width: 500, top: -500 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: 500, width: 500, top: -500 }),
            animate('0.2s ease-in',
              style({ height: 0, width: 0, top: 0 }))
          ]
        )
      ]
    )
  ]
})
export class SceneComponent implements OnInit {

  @Input() run: Run;
  @Input() selectedItem?: Item = undefined;
  @Output() pushTextEvent = new EventEmitter<string>();
  @Output() interactionEndSignal = new EventEmitter<any>();
  @Output() itemBoughtSignal = new EventEmitter<Item>();
  @Output() questCompletedSignal = new EventEmitter<Item>();
  ready: boolean = false;

  fightManager: FightManagerService;
  runService: RunService;

  public shopOpened: boolean = false;
  public shopDisabled: boolean = false;
  public shopItems: Item[] = [];

  constructor(fightManager: FightManagerService, runService: RunService) {
    this.run = new Run();
    this.fightManager = fightManager;
    this.runService = runService;
  }

  ngOnInit(): void {
  }

  update(updatedRun: Run) {
    this.run = updatedRun;
  }

  // Location actions

  moveTo(location: Location) {
    this.run.currentLocation = location;
    this.pushTextEvent.emit("The party has moved to " + location.name + ".");
    if (location.fight && location.fight.length > 0) {
      // start fight
      this.pushTextEvent.emit("Enemies are attacking the party! " + location.name + ".");
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
        if (el.name.includes('money')) {
          this.run.inventory.money = this.run.inventory.money + +el.name.replace(/[^0-9]/g, "");
          this.pushTextEvent.emit("You found " + el.name + "!");
          this.pushTextEvent.emit("That was placed into the inventory");
        } else {
          this.run.inventory.items.push(el);
          this.pushTextEvent.emit("You found a " + el.name + "!");
          this.pushTextEvent.emit("The item was placed into the inventory");
        }
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
    if (location) {
      this.pushTextEvent.emit("The party is back from the " + location.name + ".");
      this.pushTextEvent.emit("What's our next move?");
    }
  }

  interact(data: { character: Character; action: any }) {
    // If the character reacts to the interaction, activate the specified effect
    if (data.character.interactions ? data.character.interactions.filter((interaction: Interaction) => interaction.reactTo == data.action.name).length > 0 : false) {
      let interaction = data.character.interactions.filter((interaction: Interaction) => interaction.reactTo == data.action.name)[0];
      if (interaction.effect == EffectType.fight) {
        this.pushTextEvent.emit(interaction.text);
        this.startFight(interaction.effectTarget);
      }
      if (interaction.effect == EffectType.giveItem) {
        interaction.effectTarget.forEach((el: Item) => {
          this.run.inventory.items.push(el);
          this.pushTextEvent.emit(data.character.name + " gave you a " + el.name + "!")
          this.pushTextEvent.emit("The item was placed into the inventory");
        });
      }
      if (interaction.vanishes) {
        let characterIndex = this.run.currentLocation!.actors?.findIndex(el => { return data.character == el as Character });
        delete this.run.currentLocation!.actors![characterIndex!];
        this.run.currentLocation!.actors = this.run.currentLocation!.actors!.filter(item => item);
      }
      this.questCompletedSignal.emit();
      this.pushTextEvent.emit("You gained 1 EXP!");
    }
    // If it does not react to the interaction, activate the standard effect of the object
    else if (data.action.effect) {
      console.log("reacted with sandard interaction");
    }
    // If the object has no effect, send an error message
    else {
      this.pushTextEvent.emit("Using " + data.action.name + " on " + data.character.name + " had no effect...");
    }
    this.selectedItem = undefined;
    this.interactionEndSignal.emit();
  }

  toggleShop(items?: Item[]) {
    this.shopDisabled = true;
    if (items) this.shopItems = items;
    this.shopOpened = !this.shopOpened;
    if (this.shopOpened)
      this.pushTextEvent.emit("[Merchant]: Take a good look!");
    else
      this.pushTextEvent.emit("[Merchant]: Thanks for your business.");
  }

  buy(item: any) {
    // TODO: check money, if not enough error message
    if (this.run.inventory.money <= item.moneyValue) {
      this.pushTextEvent.emit("[Merchant]: Sorry pal, that's too much money for you!");
    } else {
      this.run.inventory.money = this.run.inventory.money - item.moneyValue;
      this.pushTextEvent.emit("That's a great deal! It's yours.");
      this.run.inventory.items.push(item);
    }
  }

  private startFight(fight: Character[]) {
    this.run.state = RunState.Fight;
    this.fightManager.startFight(fight, this.run.party);
    this.pushTextEvent.emit("Now it's " + this.fightManager.currentCharacter.name + "'s turn. What will be his next Action?");
  }

  attack(enemyIndex: number) {
    let defendingCharacter = this.fightManager.getEnemy(enemyIndex);
    let damage = this.fightManager.processAttack(this.fightManager.currentCharacter, defendingCharacter);
    this.pushTextEvent.emit(defendingCharacter.name + " gets " + damage + " points of damage!");
    if (this.fightManager.isBattleOver()) {
      this.endFight(defendingCharacter);
    } else {
      this.fightManager.isEnemyTurn = true;
      this.fightManager.resumeFightLoop();
    }
  }

  private endFight(defendingCharacter: Character) {
    var joins = false;
    this.fightManager.endFight();
    if (this.run.currentLocation)
      this.run.currentLocation.fight = [];
    let deadActorIndex = this.run.currentLocation?.actors?.findIndex(c => { return c.name === defendingCharacter.name; });
    if (this.run.currentLocation && this.run.currentLocation?.actors && deadActorIndex) {
      var deadActor = this.run.currentLocation?.actors[deadActorIndex] as PlayingCharacter;
      if (deadActor && deadActor.joinsParty)
        joins = true;
    }
    if (this.run.currentLocation && this.run.currentLocation.actors && deadActorIndex && deadActorIndex > -1) {
      this.run.currentLocation.actors.splice(deadActorIndex, 1);
    }
    this.run.state = RunState.Location;
    // gets experience 
    var gainedExperience = this.run.experience + (1 * this.run.level);
    this.run.experience = gainedExperience;
    this.pushTextEvent.emit("You are safe! Enemy is defeated! The party gains " + gainedExperience + " EXP");
    if (joins) {
      deadActor!.stats.healthPoints = deadActor!.stats.constitution;
      this.run.party.push(deadActor!);
      this.pushTextEvent.emit(deadActor!.name + " decided to join your party!");
      if (this.run.currentLocation)
        this.explore(this.run.currentLocation);
    } else {
      if (this.run.currentLocation)
        this.explore(this.run.currentLocation);
    }
  }

  rest() {
    if (this.run.inventory.money < 200) {
      this.pushTextEvent.emit("I can make you rest here for 200$, but i don't think you have that much money");
    } else {
      this.run.inventory.money = this.run.inventory.money - 200;
      this.run.party.forEach(el => el.stats.healthPoints = el.stats.constitution);
      this.pushTextEvent.emit("You and your party wake up well rested after a full night of sleep.");
    }
  }

  flee() {
    // TODO
  }

  // NPC interactions

  talkToActor(a: Actor) {
    console.log(this.run.currentLocation?.actors)
    this.pushTextEvent.emit(a.name + ": " + a.dialogue);
  }

  engageFightWith(a: Actor) {
    console.log(this.run.currentLocation?.actors)
    this.pushTextEvent.emit("You engaged combat with " + a.name + ".");
    this.startFight([a as Character]);
  }

  getBackgroundImage() {
    if (this.run.state == RunState.Exploration)
      return this.run.stage.backgroundPath;
    if (this.run.state == RunState.Fight || this.run.state == RunState.Location)
      return this.run.currentLocation?.backgroundPath;
    return "/assets/images/splash_art.png";
  }

  refreshLocations() {
    this.run.stage.currentLocations = this.runService.getRefreshedLocations();
  }

}
