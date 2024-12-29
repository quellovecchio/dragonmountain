import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RunState } from '../../model/RunState';
import { Location } from '../../model/Location';
import { Character } from '../../model/Actors/Character';
import { FightManagerService } from '../../services/fight-manager.service';
import { Actor } from '../../model/Actors/Actor';
import { Item } from '../../model/items/Item';
import { RunService } from '../../services/run.service';
import { ItemService } from '../../services/item.service';
import { Constants } from 'src/assets/constants';
import { UiService } from '../layers/ui-layer/ui.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit {
  
  @Output() itemBoughtSignal = new EventEmitter<Item>();

  fightManager: FightManagerService;

  constructor(fightManager: FightManagerService, public runService: RunService, public itemService: ItemService, private uiService: UiService) {
    this.fightManager = fightManager;
  }

  ngOnInit(): void {
  }

  // Location actions

  returnToMap(location: Location) {
    this.runService.getRun().state = RunState.Exploration;
    this.runService.getRun().currentLocation = undefined;
    if (location) {
      this.uiService.pushText("The party is back from " + location.name + ".");
      this.uiService.pushText("What's our next move?");
    }
    console.log("----- updating questline counter -------");
    console.log("older counter value: " + this.runService.getRun().questlineCounter);
    this.runService.getRun().questlineCounter = this.runService.getRun().questlineCounter + location.storylineCounter;
    console.log("updated counter value: " + this.runService.getRun().questlineCounter);
    console.log("----- done updating questline counter -------");
    this.runService.removeLocationFromPool(location.id);
    var questlineCounterCrossed = false;
    if(this.runService.getRun().questlineCounter >= (1.5 + ((this.runService.getRun().level - 1) * 0.2)))
      questlineCounterCrossed = true;

    // if storyline counter crosses the limit go to next questline stage
    // if not, call locations from pool
    this.runService.refreshLocations(questlineCounterCrossed);
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
        this.uiService.pushText(data.skill.name + "is used on " + defendingCharacter.name + ", so he suffers " + damage + " points of damage!");
      }

      if (data.skill.effect == EffectType.heal) {
        // TODO
      }

      if (data.skill.effect == EffectType.magicDamage) {
        let defendingCharacter = this.fightManager.getEnemy(data.enemyIndex);
        let damage = this.fightManager.processAttack(this.fightManager.currentCharacter, defendingCharacter, true);
        if (defendingCharacter && defendingCharacter.name)
          this.uiService.pushText(defendingCharacter.name + " gets " + damage + " points of damage!");
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
          this.runService.getRun().inventory.items.push(stolenItem);
          this.uiService.pushText("you managed to steal a " + stolenItem.name + " to " + defendingCharacter.name + "!");
        } else
          this.uiService.pushText("you tried to snuck something under " + defendingCharacter.name + "'s nose, but he wasn't fooled by your tricks");
      }

      // TODO implement aoe damage,
    } else {
      this.uiService.pushText("That man is too tired to use that skill...");
    }
  } */

  rest() {
    if (this.runService.getRun().inventory.money < 200) {
      this.uiService.pushText("I can make you rest here for 200$, but i don't think you have that much money");
    } else {
      this.runService.getRun().inventory.money = this.runService.getRun().inventory.money - 200;
      this.runService.getRun().party.forEach(el => el.stats.healthPoints = el.stats.constitution);
      this.uiService.pushText("You and your party wake up well rested after a full night of sleep.");
    }
  }

  // NPC interactions
  
  talkToActor(a: Actor) {
    this.uiService.talkToNpcPushText(a.name, a.dialogue);
  }

  engageFightWith(a: Actor) {
    console.log(this.runService.getRun().currentLocation?.actors)
    this.uiService.pushText("You engaged combat with " + a.name + ".");
    this.runService.startFight([a as Character]);
  }

  getRandomNumber(min: number, max: number) {
    max = max + 1;
    return Math.floor(Math.random() * (max - min) + min);
  }


}
