import { Injectable } from '@angular/core';
import { Run } from '../model/Run';
import { Constants } from 'src/assets/constants';
import { Location } from "../model/Location";
import { Item } from '../model/items/Item';
import { Actor } from '../model/Actors/Actor';
import { Character } from '../model/Actors/Character';
import { STARTING_STATS } from '../editor/diy/diy.component';
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';
import { Interaction, EffectType } from '../model/Interaction';
import { RunState } from '../model/RunState';
import { FightManagerService } from './fight-manager.service';
import { DataService } from '../data.service';
import { UiService } from '../game/ui-layer/ui.service';

@Injectable({
  providedIn: 'root'
})
export class RunService {

  run: Run = new Run(new PlayingCharacter(STARTING_STATS));
  charactersJoiningAfterBattle: PlayingCharacter[] = [];

  constructor(private uiService: UiService, private fightService: FightManagerService, private dataService: DataService) { }

  getRun() {
    return this.run;
  }

  setRun(run: Run) {
    this.run = run;
  }

  refreshLocations(fromQuestlineFlag: boolean) {
    if (!fromQuestlineFlag)
      this.getRun().stage.currentLocations = this.getRefreshedLocations();
    else
      this.getRun().stage.currentLocations = this.getNextQuestlineLocations();
  }

  getRefreshedLocations() {
    console.log('getting new locations from the pool.')
    var count = Constants.MAX_STAGE_ELEMENTS;
    if (count >= this.run.stage.locations.length) {
      // If count is greater than or equal to the list length, return the entire list
      const result = this.run.stage.locations.slice();
      this.run.stage.locations.length = 0; // Clear the original list
      return result;
    }

    const result: Location[] = [];
    const extractedIds: number[] = [];
    while (extractedIds.length < count) {
      const randomIndex = Math.floor(Math.random() * this.run.stage.locations.length);
      if(extractedIds.length == 0 || !extractedIds.find(el => el === randomIndex)) {
        result.push(this.run.stage.locations[randomIndex]);
        extractedIds.push(randomIndex);
      }
    }

    return result;
  }

  getNextQuestlineLocations(): Location[] {
    console.log('getting new locations from the next quesline phase.')
    var result: Location[] = [];
    if (this.run.nextQuestlinePhase)
      result = this.run.nextQuestlinePhase;
    return result;
  }

  removeLocationFromPool(locationId: number) {
    console.log("------- updating stage locations -------")
    console.log("array before:")
    console.log(this.run.stage.locations);
    var locationIndex = this.run.stage.locations.findIndex((l: Location) => { l.id == locationId });
    this.run.stage.locations.splice(locationIndex, 1);
    console.log("array after:")
    console.log(this.run.stage.locations);
    console.log("------- done updating stage locations -------")
  }

  removeCharacterFromCurrentLocation(characterId: number) {
    this.getRun().currentLocation!.actors = this.getRun().currentLocation!.actors.filter((el: Actor) => el.id != characterId)
  }

  removeItemFromInventory(item: Item) {
    const index = this.run.inventory.items.indexOf(item, 0);
    if (index > -1) {
      this.run.inventory.items.splice(index, 1);
    }
    this.uiService.updateInventory(this.run.inventory.items);
  }

  addItemToInventory(item: Item) {
    this.run.inventory.items.push(item);
    this.uiService.updateInventory(this.run.inventory.items);
  }

  setNextQuestlinePhase(locations: Location[]) {
    this.run.nextQuestlinePhase = locations;
  }

  useItemOn(item: Item, actor: Actor) {
    this.removeItemFromInventory(item);
    console.log("used " + this.uiService.getSelectedItem()?.name + " on " + actor.name);
    this.interact({ character: actor as Character, action: item });
    this.uiService.setSelectedItem(undefined);
  }

  interact(data: { character: Character; action: any }) {
    // If the character reacts to the interaction, activate the specified effect
    let interaction = this.findInteraction(data.character.interactions, data.action);
    let effectType = EffectType.resurrect;
    if (interaction) {
      if (interaction.effect == EffectType.fight) {
        effectType = EffectType.fight;
        this.uiService.pushText(interaction.text);
        this.removeCharacterFromCurrentLocation(interaction.effectTarget);
        this.startFight(interaction.effectTarget);
      }
      if (interaction.effect == EffectType.giveItem) {
        effectType = EffectType.giveItem;
        this.uiService.pushText(interaction.text)
        interaction.effectTarget.forEach((el: number) => {
          let newItem = this.dataService.getItemById(el);
          this.addItemToInventory(newItem);
          this.uiService.pushText(data.character.name + " gave you a " + newItem.name + "!")
          this.uiService.pushText("The item was placed into the inventory");
        });
      }
      if (interaction.effect == EffectType.kill) {
        effectType = EffectType.kill;
        if (this.getRun().currentLocation && this.getRun().currentLocation!.actors.filter((el: Actor) => el.id == interaction!.effectTarget).length == 0) {
          this.uiService.pushText(interaction.text);
        }
      }
      if (interaction.effect == EffectType.vanishes) {
        effectType = EffectType.vanishes;
        this.uiService.pushText(interaction.text);
        let characterIndex = this.getRun().currentLocation!.actors?.findIndex(el => { return data.character == el as Character });
        delete this.getRun().currentLocation!.actors![characterIndex!];
        this.getRun().currentLocation!.actors = this.getRun().currentLocation!.actors!.filter(item => item);
      }
      if (interaction.storyChildrenIds && interaction.storyChildrenIds.length > 0) {
        interaction.storyChildrenIds.forEach((el: number) => {
          this.getNextQuestlineLocations().push(this.dataService.getLocationById(el));
        });
      }
      this.resolveInteraction(data.character, effectType);
    }
    // If it does not react to the interaction, activate the standard effect of the object
    else if (data.action.effect) {
      console.log("reacted with standard interaction");
      switch (data.action.effect.type) {
        case EffectType.heal:
          this.uiService.pushText(`${data.character.name} healed ${data.action.effect.power} HP`);
          var newHpValue = data.character.stats.healthPoints + data.action.effect.power;
          data.character.stats.healthPoints = (newHpValue > data.character.stats.constitution) ? data.character.stats.constitution : newHpValue;
          let healInteraction = this.findInteraction(data.character.interactions, EffectType.heal);
          if (healInteraction) {
            this.resolveInteraction(data.character, EffectType.heal);
            this.interact({ character: data.character, action: healInteraction });
          }
          break;
        default:
          console.log("no data found for effect")
          break;
      }
    }
    // If the object has no effect, send an error message
    else {
      this.uiService.pushText("Using " + data.action.name + " on " + data.character.name + " had no effect...");
    }
  }

  removeOneItemFromInventoryById(items: Item[], idToRemove: number): Item[] {
    const index = items.findIndex(item => item.id === idToRemove);
    if (index !== -1) {
      items.splice(index, 1);
    }
    return items;
  }

  public startFight(fight: Character[]) {
    this.getRun().state = RunState.Fight;
    this.getRun().currentFight = this.prepareFight(fight);
    fight.forEach(actor => {
      if ((actor as Character).joinsParty) {
        this.charactersJoiningAfterBattle.push(actor as PlayingCharacter);
      }
    });
    this.fightService.startFight(this.getRun().currentFight!, this.getRun().party);
    const intervalId = setInterval(() => {
      if (this.fightService.isBattleOver()) {
        this.endFight();
        clearInterval(intervalId);
      }
    }, 2000);
  }

  prepareFight(fight: Character[]): Character[] {
    let newFight: Character[] = [];
    let usedCharactersIds: number[] = [];
    for (let i = 0; i < fight.length; i++) {
      let character = fight[i];
      let newCharacter = new Character();
      newCharacter.name = character.name;
      newCharacter.stats = character.stats;
      newCharacter.skills = character.skills;
      newCharacter.imagePath = character.imagePath;
      newCharacter.loot = character.loot;
      if (usedCharactersIds.includes(character.id)) {
        newCharacter.name = character.name + ' ' + i;
      } else {
        usedCharactersIds.push(character.id);
      }
      newFight.push(newCharacter);
    }
    return newFight;
  }

  private endFight() {
    this.getRun().currentFight!.forEach(actor => {
      this.loot(actor);
    });

    this.getRun().currentLocation!.actors.forEach((a: Actor) => {
      if (this.charactersJoiningAfterBattle.findIndex((el: PlayingCharacter) => el.name == a.name) >= 0
        || this.fightService.enemies.findIndex((el: Character) => el.name == a.name) >= 0) {
        let characterIndex = this.getRun().currentLocation!.actors!.findIndex(el => { return a == el });
        delete this.getRun().currentLocation!.actors![characterIndex];
        this.getRun().currentLocation!.actors = this.getRun().currentLocation!.actors!.filter(item => item);
      }
    })
    this.fightService.endFight();
    this.getRun().state = RunState.Location;
    var gainedExperience = (1 * this.getRun().level);
    this.getRun().experience = this.getRun().experience + gainedExperience;
    this.uiService.pushText("You are safe! Enemy is defeated! The party gains " + gainedExperience + " EXP");
    if (this.charactersJoiningAfterBattle.length > 0) {
      this.charactersJoiningAfterBattle.forEach(actor => {
        actor.stats.healthPoints = actor.stats.constitution;
        actor.dead = false;
        this.getRun().party.push(actor);
        this.uiService.pushText(actor.name + " decided to join your party!");
      });
      this.charactersJoiningAfterBattle = [];
    }
    if (this.getRun().currentLocation) {
      this.getRun().currentLocation!.fight = [];
      this.explore(this.getRun().currentLocation!);
    }
  }

  moveTo(location: Location) {
    var locationValue = undefined;
    if (location.children && location.children.length > 0)
      this.setNextQuestlinePhase(this.dataService.getLocationsById(location.children));
    locationValue = location;
    this.getRun().currentLocation = locationValue;
    this.uiService.pushText("The party has moved to " + locationValue.name + ".");
    if (locationValue.fight && locationValue.fight.length > 0) {
      // start fight
      this.uiService.pushText("Enemies are attacking the party!");
      this.startFight(locationValue.fight);
    } else {
      this.explore(location);
    }
  }

  public explore(location: Location) {
    this.loot(location);
    if (location.actors && location.actors?.length > 0) {
      this.getRun().state = RunState.Location;
    }
  }

  loot(item: Location | Actor) {
    if (item.loot && item.loot.length > 0) {
      // add loot to party inventory
      item.loot.forEach(el => {
        if (el.name.includes('money')) {
          this.getRun().inventory.money = this.getRun().inventory.money + +el.name.replace(/[^0-9]/g, "");
          this.uiService.pushText("You found " + el.name + "!");
        } else {
          this.addItemToInventory(el);
          this.uiService.pushText("You found a " + el.name + "!");
        }
      });
      item.loot = [];
    }
  }

  findInteraction(interactions: Interaction[], type: EffectType | Item) {
    return interactions.find((interaction: Interaction) => interaction.reactTo == EffectType[type as EffectType] || interaction.reactTo == '' + ((type as Item).id));
  }

  resolveInteraction(actor: Actor, type: EffectType | Item) {
    actor.interactions = actor.interactions.filter((interaction: Interaction) => interaction.reactTo != EffectType[type as EffectType] || interaction.reactTo == '' + ((type as Item).id));
  }
}
