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
import { UiService } from '../ui-layer/ui.service';
import { EffectType } from 'src/app/model/Interaction';
import { MusicService } from 'src/app/services/music.service';
import { Skill } from 'src/app/model/Skill';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit {
  
  @Output() itemBoughtSignal = new EventEmitter<Item>();

  fightManager: FightManagerService;

  constructor(fightManager: FightManagerService, public runService: RunService, public itemService: ItemService, private uiService: UiService, private musicService: MusicService, private dataService: DataService) {
    this.fightManager = fightManager;
  }

  ngOnInit(): void {
  }

  // Location actions

  returnToMap(location: Location) {
    this.musicService.playSound('room-out');
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
    if(this.runService.getRun().questlineCounter >= (1.5 + ((this.runService.getRun().level - 1) * 0.2))) {
      this.runService.getRun().questlineCounter = 0;
      questlineCounterCrossed = true;
    }
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

  rest() {
    if (this.runService.getRun().inventory.money < 200) {
      this.uiService.pushText("I can make you rest here for 200$, but i don't think you have that much money");
    } else {
      this.runService.getRun().inventory.money = this.runService.getRun().inventory.money - 200;
      this.runService.getRun().party.forEach(el => {
        if (!el.dead) {
          el.stats.healthPoints = el.stats.constitution;
          el.stats.skillPoints = el.stats.intelligence;
        }
      });
      this.uiService.pushText("You and your party wake up well rested after a full night of sleep.");
    }
  }

  reviveFromActor() {
    const deadMembers = this.runService.getRun().party.filter(p => p.dead);
    if (deadMembers.length === 0) {
      this.uiService.pushText("None of your party members are dead.");
      return;
    }
    const cost = 500;
    if (this.runService.getRun().inventory.money < cost) {
      this.uiService.pushText(`I can bring them back for ${cost}$, but I don't think you have that much money.`);
      return;
    }
    this.runService.getRun().inventory.money -= cost;
    deadMembers.forEach(member => {
      member.dead = false;
      member.stats.healthPoints = Math.floor(member.stats.constitution / 2);
      this.uiService.pushText(`${member.name} has been revived with ${member.stats.healthPoints} HP!`);
    });
  }

  // NPC interactions
  
  talkToActor(a: Actor) {
    const talkInteraction = this.runService.findInteraction(a.interactions, EffectType.talk);
    const killInteraction = this.runService.findInteraction(a.interactions, EffectType.kill);

    if (talkInteraction) {
      this.uiService.talkToNpcPushText(a.name, talkInteraction.text);
      if (talkInteraction.effect === EffectType.giveItem && talkInteraction.effectTarget) {
        talkInteraction.effectTarget.forEach((itemId: number) => {
          const newItem = this.dataService.getItemById(itemId);
          this.runService.addItemToInventory(newItem);
          this.uiService.pushText(a.name + ' gave you a ' + newItem.name + '!');
        });
      }
      this.runService.resolveInteraction(a, EffectType.talk);
    } else {
      this.uiService.talkToNpcPushText(a.name, a.dialogue);
    }

    if (killInteraction) {
      this.uiService.pushText(killInteraction.text);
      this.runService.resolveInteraction(a, EffectType.kill);
    }
  }

  engageFightWith(a: Actor) {
    this.uiService.pushText("You engaged combat with " + a.name + ".");
    this.runService.removeCharacterFromCurrentLocation(a.id);
    this.runService.startFight([a as Character]);
  }

  /**
   * Called when the fight component emits a skill-use signal for out-of-fight targeting.
   * Full implementation is part of the out-of-fight skills step (milestone 0.5).
   */
  useSkillOn(data: { skill: Skill; target: Actor }) {
    this.runService.castSkillOnActor(this.runService.getRun().party[0], data.skill, data.target);
  }

  flee() {
    // TODO: implement flee logic (costs 1 EXP, not available in locked fights)
    this.uiService.pushText("The party fled from battle!");
    this.runService.getRun().state = RunState.Location;
  }

  getRandomNumber(min: number, max: number) {
    max = max + 1;
    return Math.floor(Math.random() * (max - min) + min);
  }


}
