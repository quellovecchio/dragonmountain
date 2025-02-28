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
      this.runService.getRun().party.forEach(el => el.stats.healthPoints = el.stats.constitution);
      this.uiService.pushText("You and your party wake up well rested after a full night of sleep.");
    }
  }

  // NPC interactions
  
  talkToActor(a: Actor) {
    // TODO move this code to interact
    let talkInteraction = this.runService.findInteraction(a.interactions, EffectType.talk);
    let killInteraction = this.runService.findInteraction(a.interactions, EffectType.kill);
    if(talkInteraction) {
      this.uiService.talkToNpcPushText(a.name, talkInteraction.text);
      if(talkInteraction.effectTarget) {
        this.runService.interact({ character: (a as Character), action: talkInteraction });
      }
      this.runService.resolveInteraction(a, EffectType.talk);
    }
    if(killInteraction) {
      if(killInteraction.effectTarget) {
        this.runService.interact({ character: (a as Character), action: killInteraction });
      }
      this.runService.resolveInteraction(a, EffectType.kill);
    }
    else
      this.uiService.talkToNpcPushText(a.name, a.dialogue);
  }

  engageFightWith(a: Actor) {
    this.uiService.pushText("You engaged combat with " + a.name + ".");
    this.runService.removeCharacterFromCurrentLocation(a.id);
    this.runService.startFight([a as Character]);
  }

  getRandomNumber(min: number, max: number) {
    max = max + 1;
    return Math.floor(Math.random() * (max - min) + min);
  }


}
