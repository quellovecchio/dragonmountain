import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Run } from '../../model/Run';
import { RunState } from '../../model/RunState';
import { Location } from '../../model/Location';
import { Character } from '../../model/Actors/Character';
import { FightManagerService } from '../../services/fight-manager.service';
import { Actor } from '../../model/Actors/Actor';
import { PlayingCharacter } from '../../model/Actors/PlayingCharacter';
import { Item } from '../../model/items/Item';
import { EffectType, Interaction } from '../../model/Interaction';
import { animate, style, transition, trigger } from '@angular/animations';
import { RunService } from '../../services/run.service';
import { ItemService } from '../../services/item.service';
import { Skill } from '../../model/Skill';
import { ViewportService } from '../viewport/viewport.service';
import { Constants } from 'src/assets/constants';
import { TreeNode } from 'src/app/model/QuestlineTree';
import { STARTING_STATS } from 'src/app/editor/diy/diy.component';

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
  @Input() fightSpeed!: number;
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

  joinsParty: boolean = false;
  joiningCharacters: PlayingCharacter[] = [];
  toDeleteIndexes: number[] = [];

  constructor(fightManager: FightManagerService, runService: RunService, public itemService: ItemService, private viewportService: ViewportService) {
    this.run = new Run(new PlayingCharacter(STARTING_STATS));
    this.fightManager = fightManager;
    this.runService = runService;
  }

  ngOnInit(): void {
  }

  update(updatedRun: Run) {
    this.run = updatedRun;
  }

  // Location actions

  moveTo(location: any) {
    var locationValue = undefined;
    if(location.children)
      locationValue = location.location;
    else
      locationValue = location;
    this.run.currentLocation = locationValue;
    this.viewportService.pushText("The party has moved to " + locationValue.name + ".");
    if (locationValue.fight && locationValue.fight.length > 0) {
      // start fight
      this.viewportService.pushText("Enemies are attacking the party!");
      this.startFight(locationValue.fight);
    } else {
      this.explore(location);
    }
  }

  private explore(location: any) {
    if(location.children) {
      this.run.currentQuestlinePhase = location as TreeNode;
      this.loot((location as TreeNode).location);
      if ((location as TreeNode).location.actors && (location as TreeNode).location.actors?.length > 0) {
        this.run.state = RunState.Location;
      }
    } else {
      this.loot(location);
      if (location.actors && location.actors?.length > 0) {
        this.run.state = RunState.Location;
      }
    }
  }

  returnToMap(location: Location) {
    this.run.state = RunState.Exploration;
    this.run.currentLocation = undefined;
    if (location) {
      this.viewportService.pushText("The party is back from " + location.name + ".");
      this.viewportService.pushText("What's our next move?");
    }
    console.log("----- updating questline counter -------");
    console.log("older counter value: " + this.run.questlineCounter);
    this.run.questlineCounter = this.run.questlineCounter + location.storylineCounter;
    console.log("updated counter value: " + this.run.questlineCounter);
    console.log("----- done updating questline counter -------");
    this.runService.removeLocationFromPool(location.id);
    var questlineCounterCrossed = false;
    if(this.run.questlineCounter >= (1.5 + ((this.run.level - 1) * 0.2)))
      questlineCounterCrossed = true;

    // if storyline counter crosses the limit go to next questline stage
    // if not, call locations from pool
    this.refreshLocations(questlineCounterCrossed);
  }

  interact(data: { character: Character; action: any }) {
    // If the character reacts to the interaction, activate the specified effect
    if (data.character.interactions ? data.character.interactions.filter((interaction: Interaction) => interaction.reactTo == data.action.name).length > 0 : false) {
      let interaction = data.character.interactions.filter((interaction: Interaction) => interaction.reactTo == data.action.name)[0];
      if (interaction.effect == EffectType.fight) {
        this.viewportService.pushText(interaction.text);
        this.startFight(interaction.effectTarget);
      }
      if (interaction.effect == EffectType.giveItem) {
        this.viewportService.pushText(interaction.text)
        interaction.effectTarget.forEach((el: Item) => {
          this.run.inventory.items.push(el);
          this.viewportService.pushText(data.character.name + " gave you a " + el.name + "!")
          this.viewportService.pushText("The item was placed into the inventory");
        });
      }
      if (interaction.vanishes) {
        let characterIndex = this.run.currentLocation!.actors?.findIndex(el => { return data.character == el as Character });
        delete this.run.currentLocation!.actors![characterIndex!];
        this.run.currentLocation!.actors = this.run.currentLocation!.actors!.filter(item => item);
      }
      this.questCompletedSignal.emit();
      this.viewportService.pushText("You gained 1 EXP!");
    }
    // If it does not react to the interaction, activate the standard effect of the object
    else if (data.action.effect) {
      console.log("reacted with standard interaction");
      switch (data.action.effect.type) {
        case EffectType.heal:
          this.viewportService.pushText(`${data.character.name} healed ${data.action.effect.power} HP`);
          var newHpValue = data.character.stats.healthPoints + data.action.effect.power;
          data.character.stats.healthPoints = (newHpValue > data.character.stats.constitution) ? data.character.stats.constitution : newHpValue;
          break;
        default:
          console.log("no data found for effect")
          break;
      }
    }
    // If the object has no effect, send an error message
    else {
      this.viewportService.pushText("Using " + data.action.name + " on " + data.character.name + " had no effect...");
    }
    this.runService.items.filter((item) => item.id == this.selectedItem!.id);
    this.selectedItem = undefined;
    this.interactionEndSignal.emit();
  }

  toggleShop(items?: Item[]) {
    this.shopDisabled = true;
    if (items) this.shopItems = items;
    this.shopOpened = !this.shopOpened;
    if (this.shopOpened)
      this.viewportService.pushText("[Merchant]: Take a good look!");
    else
      this.viewportService.pushText("[Merchant]: Thanks for your business.");
  }

  buy(item: any) {
    // TODO: check money, if not enough error message
    if (this.run.inventory.money < item.moneyValue) {
      this.viewportService.pushText("[Merchant]: Sorry pal, that's too much money for you!");
    } else {
      this.run.inventory.money = this.run.inventory.money - item.moneyValue;
      this.viewportService.pushText("That's a great deal! It's yours.");
      this.run.inventory.items.push(item);
    }
  }

  private startFight(fight: Character[]) {
    this.run.state = RunState.Fight;
    this.run.currentFight = this.createFightToDisplay(fight);
    fight.forEach(actor => {
      if ((actor as Character).joinsParty) {
        this.joinsParty = true;
        this.joiningCharacters.push(actor as PlayingCharacter);
      }
      this.run.currentLocation!.actors!.forEach((roomActor, i) => {
        if (roomActor.name === actor.name)
          this.toDeleteIndexes.push(i);
      });
    });
    this.fightManager.startFight(this.run.currentFight, this.run.party);
    const intervalId = setInterval(() => {
      if (this.fightManager.isBattleOver()) {
        this.endFight();
        clearInterval(intervalId);
      }
    }, 2000);
  }

  createFightToDisplay(fight: Character[]): Character[] {
    let newFight: Character[] = [];
    let usedCharactersIds: number[] = [];
    for (let i = 0; i < fight.length; i++) {
      let character = fight[i];
      let newCharacter = character;
      if(usedCharactersIds.includes(newCharacter.id)) {
        newCharacter.name = newCharacter.name + ' ' + i;
      } else {
        usedCharactersIds.push(newCharacter.id);
      }
      newCharacter.id = i;
      newFight.push(newCharacter);
    }
    return newFight;
  }

  animateAttackOn(actor: Actor) {
    actor.attacked = true;
    setTimeout(() => {
      actor.attacked = false;
    }, 3500 / Constants.TEXT_SPEED);
  }


  /* OLD CODE TO MOVE
  attack(data: { enemyIndex: number, enemy: Actor }) {
    this.animateAttackOn(data.enemy);
    let defendingCharacter = this.fightManager.getEnemy(data.enemyIndex);
    // TODO animate defense;
    let damage = this.fightManager.processAttack(this.fightManager.currentCharacter, defendingCharacter, false);
  }

  useSkillOn(data: { skill: Skill, enemyIndex: number, enemy: Actor }) {
    this.animateAttackOn(data.enemy);
    if (this.fightManager.deductSkillPoints(data.skill)) {
      let defendingCharacter = this.fightManager.getEnemy(data.enemyIndex);
      if (data.skill.effect == EffectType.magicDamage) {
        let damage = this.fightManager.processAttack(this.fightManager.currentCharacter, defendingCharacter, true);
        this.viewportService.pushText(data.skill.name + "is used on " + defendingCharacter.name + ", so he suffers " + damage + " points of damage!");
      }

      if (data.skill.effect == EffectType.heal) {
        // TODO
      }

      if (data.skill.effect == EffectType.magicDamage) {
        let defendingCharacter = this.fightManager.getEnemy(data.enemyIndex);
        let damage = this.fightManager.processAttack(this.fightManager.currentCharacter, defendingCharacter, true);
        if (defendingCharacter && defendingCharacter.name)
          this.viewportService.pushText(defendingCharacter.name + " gets " + damage + " points of damage!");
      }

      if (data.skill.effect == EffectType.steal) {
        // steal calculates a percentage of probability given the intelligence and charisma of the character
        let charisma = this.fightManager.currentCharacter.stats.charisma;
        let intelligence = this.fightManager.currentCharacter.stats.intelligence;
        let successPerc = charisma + intelligence;
        let stealSuccess = false;
        if (successPerc <= 100) {
          successPerc = successPerc + this.getRandomNumber(0, 20);
          if (successPerc <= 100) {
            successPerc = successPerc + 15;
            let seed = this.getRandomNumber(0, 100);
            if (successPerc >= seed)
              stealSuccess = true;
          }
        }

        if (stealSuccess) {
          let enemy = this.fightManager.enemies[data.enemyIndex];
          let enemyInventory = [...enemy.loot, ...enemy.equipment];
          let stolenItem = enemyInventory[this.getRandomNumber(0, enemyInventory.length)];
          this.run.inventory.items.push(stolenItem);
          this.viewportService.pushText("you managed to steal a " + stolenItem.name + " to " + defendingCharacter.name + "!");
        } else
          this.viewportService.pushText("you tried to snuck something under " + defendingCharacter.name + "'s nose, but he wasn't fooled by your tricks");
      }

      // TODO implement aoe damage,
    } else {
      this.viewportService.pushText("That man is too tired to use that skill...");
    }
  } */

  private endFight() {
    this.run.currentFight!.forEach(actor => {
      this.loot(actor);
    });
    this.toDeleteIndexes.forEach(index => {
      this.run.currentLocation!.actors!.splice(index, 1);
    })
    this.fightManager.endFight();
    this.run.state = RunState.Location;
    var gainedExperience = this.run.experience + (1 * this.run.level);
    this.run.experience = gainedExperience;
    this.viewportService.pushText("You are safe! Enemy is defeated! The party gains " + gainedExperience + " EXP");
    if (this.joinsParty) {
      this.joiningCharacters.forEach(actor => {
        actor.stats.healthPoints = actor.stats.constitution;
        actor.dead = false;
        this.run.party.push(actor);
        this.viewportService.pushText(actor.name + " decided to join your party!");
        if (this.run.currentLocation)
          this.explore(this.run.currentLocation);
      });
      this.joiningCharacters = [];
      this.joinsParty = false;
    }
    if (this.run.currentLocation) {
      this.run.currentLocation.fight = [];
      this.explore(this.run.currentLocation);
    }
  }

  rest() {
    if (this.run.inventory.money < 200) {
      this.viewportService.pushText("I can make you rest here for 200$, but i don't think you have that much money");
    } else {
      this.run.inventory.money = this.run.inventory.money - 200;
      this.run.party.forEach(el => el.stats.healthPoints = el.stats.constitution);
      this.viewportService.pushText("You and your party wake up well rested after a full night of sleep.");
    }
  }

  flee() {
    // TODO
  }

  loot(item: Location | Actor) {
    if (item.loot && item.loot.length > 0) {
      // add loot to party inventory
      item.loot.forEach(el => {
        if (el.name.includes('money')) {
          this.run.inventory.money = this.run.inventory.money + +el.name.replace(/[^0-9]/g, "");
          this.viewportService.pushText("You found " + el.name + "!");
          this.viewportService.pushText("That was placed into the inventory");
        } else {
          this.run.inventory.items.push(el);
          this.viewportService.pushText("You found a " + el.name + "!");
          this.viewportService.pushText("The item was placed into the inventory");
        }
      });
      item.loot = [];
    }
  }

  // NPC interactions
  
  talkToActor(a: Actor) {
    this.viewportService.talkToNpcPushText(a.name, a.dialogue);
    this.loot(a);
  }

  engageFightWith(a: Actor) {
    console.log(this.run.currentLocation?.actors)
    this.viewportService.pushText("You engaged combat with " + a.name + ".");
    this.startFight([a as Character]);
  }

  getBackgroundImage() {
    if (this.run.state == RunState.Exploration)
      return this.run.stage.backgroundPath;
    if (this.run.state == RunState.Fight || this.run.state == RunState.Location)
      return this.run.currentLocation?.backgroundPath;
    return "/assets/images/splash_art.png";
  }

  refreshLocations(fromQuestlineFlag: boolean) {
    if(!fromQuestlineFlag)
      this.run.stage.currentLocations = this.runService.getRefreshedLocations();
    else 
      this.run.stage.currentLocations = this.runService.getNextStorylineLocations();
  }

  getRandomNumber(min: number, max: number) {
    max = max + 1;
    return Math.floor(Math.random() * (max - min) + min);
  }


}
