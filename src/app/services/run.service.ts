import { Injectable } from '@angular/core';
import { Run } from '../model/Run';
import { Constants } from 'src/assets/constants';
import { Location } from "../model/Location";
import { Item } from '../model/items/Item';
import { Actor } from '../model/Actors/Actor';
import { Character } from '../model/Actors/Character';
import { QuestlineTree, TreeNode } from '../model/QuestlineTree';
import { QuestlineTreeDto, TreeNodeDto } from '../model/QuestlineTreeDto';
import { STARTING_STATS } from '../editor/diy/diy.component';
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';
import { Interaction, EffectType } from '../model/Interaction';
import { RunState } from '../model/RunState';
import { FightManagerService } from './fight-manager.service';
import { DataService } from '../data.service';
import { UiService } from '../game/layers/ui-layer/ui.service';
import { BehaviorSubject } from 'rxjs';

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

  getQuestlineTree(questlines: QuestlineTreeDto[]): QuestlineTree[] {
    const questlineTrees: QuestlineTree[] = [];
    questlines.forEach(questlineDto => {
      const rootLocation = this.dataService.getLocationById(questlineDto.root.location);
      const questlineTree = new QuestlineTree(rootLocation);
      const queueDto: TreeNodeDto[] = [questlineDto.root];
      const queue: TreeNode[] = [questlineTree.root];

      while (queueDto.length > 0) {
        const currentNodeDto = queueDto.shift();
        const currentNode = queue.shift();

        if (currentNodeDto && currentNode) {
          currentNodeDto.children.forEach(childDto => {
            const childLocation = this.dataService.getLocationById(childDto);
            const childNode = new TreeNode(childLocation);
            currentNode.addChild(childNode);
            //queueDto.push(childDto);
            queue.push(childNode);
          });
        }
      }
      questlineTrees.push(questlineTree);
    });
    return questlineTrees;
  }

  refreshLocations(fromQuestlineFlag: boolean) {
    if(!fromQuestlineFlag)
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
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * this.run.stage.locations.length);
      result.push(this.run.stage.locations[randomIndex]);
      // commented because mechanics changed: room is extracted from set when completed
      //this.run.stage.locations.splice(randomIndex, 1); // Remove the selected element from the list
    }

    return result;
  }

  getNextQuestlineLocations(): TreeNode[] {
    console.log('getting new locations from the next quesline phase.')
    var result: TreeNode[] = [];
    if (this.run.nextQuestlinePhase?.children)
      result = this.run.nextQuestlinePhase?.children;
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

  removeItemFromInventory(item: Item) {
    const index = this.run.inventory.items.indexOf(item, 0);
    if (index > -1) {
      this.run.inventory.items.splice(index, 1);
    }
  }

  setnextQuestlinePhase(location: TreeNode) {
    this.run.nextQuestlinePhase = location;
  }

  useItemOn(item: Item, actor: Actor) {
    this.removeItemFromInventory(item);
    console.log("used " + this.uiService.getSelectedItem()?.name + " on " + actor.name);
    this.interact({ character: actor as Character, action: item });
    this.uiService.setSelectedItem(undefined);
  }

  interact(data: { character: Character; action: any }) {
    // If the character reacts to the interaction, activate the specified effect
    if (data.character.interactions ? data.character.interactions.filter((interaction: Interaction) => interaction.reactTo == data.action.name).length > 0 : false) {
      let interaction = data.character.interactions.filter((interaction: Interaction) => interaction.reactTo == data.action.name)[0];
      if (interaction.effect == EffectType.fight) {
        this.uiService.pushText(interaction.text);
        this.startFight(interaction.effectTarget);
      }
      if (interaction.effect == EffectType.giveItem) {
        this.uiService.pushText(interaction.text)
        interaction.effectTarget.forEach((el: Item) => {
          this.getRun().inventory.items.push(el);
          this.uiService.pushText(data.character.name + " gave you a " + el.name + "!")
          this.uiService.pushText("The item was placed into the inventory");
        });
      }
      if (interaction.vanishes) {
        let characterIndex = this.getRun().currentLocation!.actors?.findIndex(el => { return data.character == el as Character });
        delete this.getRun().currentLocation!.actors![characterIndex!];
        this.getRun().currentLocation!.actors = this.getRun().currentLocation!.actors!.filter(item => item);
      }
    }
    // If it does not react to the interaction, activate the standard effect of the object
    else if (data.action.effect) {
      console.log("reacted with standard interaction");
      switch (data.action.effect.type) {
        case EffectType.heal:
          // TODO proc heal interaction
          this.uiService.pushText(`${data.character.name} healed ${data.action.effect.power} HP`);
          var newHpValue = data.character.stats.healthPoints + data.action.effect.power;
          data.character.stats.healthPoints = (newHpValue > data.character.stats.constitution) ? data.character.stats.constitution : newHpValue;
          if (data.character.interactions.filter((req) => { return req.reactTo == "heal" }).length > 0) {
            data.character.interactions = data.character.interactions.filter((req) => { return req.reactTo == "heal" });
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
    this.getRun().inventory.items = this.getRun().inventory.items.filter((item) => item.id == this.uiService.getSelectedItem()!.id);
    this.uiService.setSelectedItem(undefined);
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
    this.charactersJoiningAfterBattle.forEach((c: Character) => {
      this.getRun().currentLocation!.actors = this.getRun().currentLocation!.actors!.filter(el => {
        el.id != c.id;
      });
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
      this.explore(this.getRun().currentLocation);
    }
  }

  moveTo(location: any) {
    var locationValue = undefined;
    if (location.children) {
      this.setnextQuestlinePhase(location as TreeNode);
      locationValue = location.location;
    }
    else
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

  public explore(location: any) {
    if (location.children) {
      this.loot((location as TreeNode).location);
      if ((location as TreeNode).location.actors && (location as TreeNode).location.actors?.length > 0) {
        this.getRun().state = RunState.Location;
      }
    } else {
      this.loot(location);
      if (location.actors && location.actors?.length > 0) {
        this.getRun().state = RunState.Location;
      }
    }
  }

  loot(item: Location | Actor) {
    if (item.loot && item.loot.length > 0) {
      // add loot to party inventory
      item.loot.forEach(el => {
        if (el.name.includes('money')) {
          this.getRun().inventory.money = this.getRun().inventory.money + +el.name.replace(/[^0-9]/g, "");
          this.uiService.pushText("You found " + el.name + "!");
          this.uiService.pushText("That was placed into the inventory");
        } else {
          this.getRun().inventory.items.push(el);
          this.uiService.pushText("You found a " + el.name + "!");
          this.uiService.pushText("The item was placed into the inventory");
        }
      });
      item.loot = [];
    }
  }
}
