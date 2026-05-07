import { Injectable } from '@angular/core';
import { Run } from '../model/Run';
import { Constants } from 'src/assets/constants';
import { Location } from "../model/Location";
import { Item } from '../model/items/Item';
import { Actor } from '../model/Actors/Actor';
import { Character } from '../model/Actors/Character';
import { STARTING_STATS } from '../editor/diy/diy.component';
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';
import { Interaction, EffectType, GiveItemInteraction, FightInteraction } from '../model/Interaction';
import { RunState } from '../model/RunState';
import { FightManagerService } from './fight-manager.service';
import { DataService } from '../data.service';
import { UiService } from '../game/ui-layer/ui.service';
import { ItemService } from './item.service';
import { Skill } from '../model/Skill';
import { MusicService } from './music.service';

@Injectable({
  providedIn: 'root'
})
export class RunService {

  run: Run = new Run(new PlayingCharacter(STARTING_STATS));
  charactersJoiningAfterBattle: PlayingCharacter[] = [];

  constructor(private uiService: UiService, private fightService: FightManagerService, private dataService: DataService, private itemService: ItemService, private musicService: MusicService) { }

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
    if (!this.run.nextQuestlinePhase)
      this.run.nextQuestlinePhase = [];
    return this.run.nextQuestlinePhase;
  }

  /** Safely appends a location to nextQuestlinePhase, initialising the array if needed. */
  private addToNextQuestlinePhase(locationId: number): void {
    if (!this.run.nextQuestlinePhase) this.run.nextQuestlinePhase = [];
    const loc = this.dataService.getLocationById(locationId);
    if (loc) this.run.nextQuestlinePhase.push(loc);
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
    if (item.id === 0) {
      this.getRun().inventory.money += 100;
      this.uiService.pushText("You received $100!");
      this.musicService.playSound('give-item');
      return;
    }
    this.musicService.playSound('give-item');
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

  /**
   * Central interaction dispatcher.
   * Finds the matching Interaction on the character (if any) for the given Item cause,
   * dispatches its effect, then resolves (consumes) the interaction.
   * Falls back to the Item's own default effect when no matching Interaction is found.
   */
  interact(data: { character: Character; action: Item }): void {
    const interaction = this.findInteraction(data.character.interactions, data.action);

    if (interaction) {
      this.uiService.pushText(interaction.text);

      switch (interaction.effect) {
        case EffectType.fight: {
          const fightInteraction = interaction as FightInteraction;
          if (fightInteraction.actorVanishes) {
            this.removeCharacterFromCurrentLocation(data.character.id);
          }
          this.startFight(fightInteraction.effectTarget as unknown as Character[]);
          break;
        }
        case EffectType.giveItem: {
          const giveInteraction = interaction as GiveItemInteraction;
          giveInteraction.effectTarget.forEach((itemId: number) => {
            const newItem = this.dataService.getItemById(itemId);
            this.addItemToInventory(newItem);
            if (newItem.id !== 0) {
              this.uiService.pushText(data.character.name + ' gave you a ' + newItem.name + '!');
              this.uiService.pushText('The item was placed into the inventory');
            }
          });
          break;
        }
        case EffectType.kill: {
          // text already pushed above; story beats handled below
          break;
        }
        case EffectType.vanishes: {
          const actorIndex = this.getRun().currentLocation!.actors
            .findIndex(a => a === (data.character as unknown as Actor));
          if (actorIndex !== -1) {
            this.getRun().currentLocation!.actors.splice(actorIndex, 1);
          }
          break;
        }
        case EffectType.talk: {
          // text already pushed above
          break;
        }
      }

      if (interaction.storyChildrenIds && interaction.storyChildrenIds.length > 0) {
        interaction.storyChildrenIds.forEach((locationId: number) => {
          this.addToNextQuestlinePhase(locationId);
        });
      }

      this.resolveInteraction(data.character, data.action, interaction);

    } else if (data.action.effect) {
      // No matching interaction — apply the item's own default effect
      console.log('reacted with standard interaction');
      switch (data.action.effect.type) {
        case EffectType.heal: {
          if (data.character.dead) {
            this.uiService.pushText(`${data.character.name} is dead and cannot be healed.`);
            break;
          }
          this.uiService.pushText(`${data.character.name} healed ${data.action.effect.power} HP`);
          const newHp = data.character.stats.healthPoints + data.action.effect.power;
          data.character.stats.healthPoints = Math.min(newHp, data.character.stats.constitution);
          const healInteraction = this.findInteraction(data.character.interactions, EffectType.heal);
          if (healInteraction) {
            this.resolveInteraction(data.character, EffectType.heal, healInteraction);
            this.uiService.pushText(healInteraction.text);
          }
          break;
        }
        case EffectType.resurrect: {
          if (!data.character.dead) {
            this.uiService.pushText(`${data.character.name} is still alive — the candle flickers uselessly.`);
            break;
          }
          data.character.dead = false;
          data.character.stats.healthPoints = Math.floor(data.character.stats.constitution / 2);
          this.uiService.pushText(`${data.character.name} rises from the dead with ${data.character.stats.healthPoints} HP!`);
          break;
        }
        default:
          console.log('no data found for effect');
          break;
      }
    } else {
      this.uiService.pushText('Using ' + data.action.name + ' on ' + data.character.name + ' had no effect...');
    }
  }

  removeOneItemFromInventoryById(items: Item[], idToRemove: number): Item[] {
    const index = items.findIndex(item => item.id === idToRemove);
    if (index !== -1) {
      items.splice(index, 1);
    }
    return items;
  }

  getAliveParty(): PlayingCharacter[] {
    return this.run.party.filter(p => !p.dead);
  }

  public startFight(fight: Character[]) {
    this.uiService.pushText("Enemies are attacking the party!");
    this.getRun().state = RunState.Fight;
    this.getRun().currentFight = this.prepareFight(fight);
    fight.forEach(actor => {
      if ((actor as Character).joinsParty) {
        this.charactersJoiningAfterBattle.push(actor as PlayingCharacter);
      }
    });
    this.fightService.startFight(this.getRun().currentFight!, this.getAliveParty());
    const intervalId = setInterval(() => {
      if (this.fightService.isBattleOver()) {
        this.endFight();
        clearInterval(intervalId);
      }
    }, 2000);
  }

  private _fightIdCounter = 90000;

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
      // Inline actors (from fight interactions) have loot as raw number IDs; resolve them.
      newCharacter.loot = (character.loot ?? []).map((el: any) =>
        typeof el === 'number' ? this.dataService.getItemById(el) : el
      );
      newCharacter.classId = character.classId;
      newCharacter.class = character.class;
      const sourceId = character.id ?? (this._fightIdCounter++);
      if (usedCharactersIds.includes(sourceId)) {
        newCharacter.name = character.name + ' ' + i;
      } else {
        usedCharactersIds.push(sourceId);
      }
      newCharacter.id = sourceId;
      newCharacter.boss = (character as any).boss ?? false;
      newFight.push(newCharacter);
    }
    return newFight;
  }

  private endFight() {
    const bossDefeated = this.getRun().currentFight?.some(c => c.boss) ?? false;

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
    this.getRun().currentLocation?.actors.forEach((a: Actor) => {
      const killInteraction = this.findInteraction(a.interactions, EffectType.kill);
      if (killInteraction) {
        this.uiService.pushText(killInteraction.text as string);
        if ((killInteraction as any).effectTarget) {
          (killInteraction as any).effectTarget.forEach((itemId: number) => {
            const item = this.dataService.getItemById(itemId);
            this.addItemToInventory(item);
            if (item.id !== 0) this.uiService.pushText(a.name + ' gave you a ' + item.name + '!');
          });
        }
        if (killInteraction.storyChildrenIds?.length) {
          killInteraction.storyChildrenIds.forEach((locationId: number) => this.addToNextQuestlinePhase(locationId));
        }
        this.resolveInteraction(a, EffectType.kill, killInteraction);
      }
    });
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

    if (bossDefeated) {
      this.advanceToNextStage();
    }
  }

  private advanceToNextStage(): void {
    this.getRun().visitedStageIds.push(this.getRun().stage.id);
    const next = this.dataService.stages.find(
      s => !this.getRun().visitedStageIds.includes(s.id)
    );
    if (!next) {
      this.uiService.pushText("There are no more lands to conquer. The world is at peace.");
      return;
    }
    this.getRun().stage = this.dataService.populateStage(next, this.dataService.getLocations());
    this.getRun().questlineCounter = 0;
    this.getRun().nextQuestlinePhase = undefined;
    this.uiService.pushText(`The darkness lifts over the Damned Plaza... A new land beckons: ${this.getRun().stage.name}.`);
    this.uiService.pushText("Steel yourself — new dangers await.");
    this.getRun().stage.currentLocations = [...this.getRun().stage.questlines];
    this.getRun().state = RunState.Exploration;
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
        if (el.id === 0) {
          this.addItemToInventory(el); // handled inside: adds $100
        } else {
          this.addItemToInventory(el);
          this.uiService.pushText("You found a " + el.name + "!");
        }
      });
      item.loot = [];
    }
  }

  /**
   * Finds an interaction triggered by the given cause.
   *   Item trigger  → matches interactions whose reactTo equals the item's numeric ID.
   *   EffectType trigger → matches interactions whose reactTo equals the EffectType name string.
   */
  findInteraction(interactions: Interaction[], trigger: EffectType | Item): Interaction | undefined {
    if (typeof trigger === 'object') {
      // Item: reactTo is stored as the numeric item ID
      return interactions.find(i => typeof i.reactTo === 'number' && i.reactTo === trigger.id);
    } else {
      // EffectType: reactTo is stored as the enum member name string (e.g. "heal", "talk")
      return interactions.find(i => typeof i.reactTo === 'string' && i.reactTo === EffectType[trigger]);
    }
  }

  /**
   * Consumes (removes) the interaction that was triggered by the given cause.
   * Updates actor.dialogue to the resolved interaction's text so subsequent
   * talks replay what already fired instead of the default dialogue.
   */
  resolveInteraction(actor: Actor, trigger: EffectType | Item, interaction?: Interaction): void {
    if (interaction) {
      actor.dialogue = Array.isArray(interaction.text) ? interaction.text : [interaction.text];
    }
    if (typeof trigger === 'object') {
      actor.interactions = actor.interactions.filter(
        i => !(typeof i.reactTo === 'number' && i.reactTo === trigger.id)
      );
    } else {
      actor.interactions = actor.interactions.filter(
        i => !(typeof i.reactTo === 'string' && i.reactTo === EffectType[trigger])
      );
    }
  }

  /**
   * Casts a skill on an actor outside of battle.
   * Handles heal, resurrect, and interaction-triggered effects.
   */
  talkTo(actor: Actor): void {
    const talkInteraction = this.findInteraction(actor.interactions, EffectType.talk);

    if (talkInteraction) {
      this.uiService.talkToNpcPushText(actor.name, talkInteraction.text);
      // A talk interaction can carry a giveItem side-effect (effectTarget: number[])
      const effectTarget = (talkInteraction as any).effectTarget as number[] | undefined;
      if (Array.isArray(effectTarget)) {
        effectTarget.forEach((itemId: number) => {
          const item = this.dataService.getItemById(itemId);
          this.addItemToInventory(item);
          if (item.id !== 0) {
            this.uiService.pushText(actor.name + ' gave you a ' + item.name + '!');
            this.uiService.pushText('The item was placed into the inventory');
          }
        });
      }
      if (talkInteraction.storyChildrenIds?.length) {
        talkInteraction.storyChildrenIds.forEach((locationId: number) => {
          this.addToNextQuestlinePhase(locationId);
        });
      }
      this.resolveInteraction(actor, EffectType.talk, talkInteraction);
    } else {
      this.uiService.talkToNpcPushText(actor.name, actor.dialogue);
    }
  }

  castSkillOnActor(caster: PlayingCharacter, skill: Skill, target: Actor): void {
    if (caster.dead) {
      this.uiService.pushText(`${caster.name} is dead and cannot cast skills.`);
      return;
    }
    if (caster.stats.skillPoints < skill.cost) {
      this.uiService.pushText(`${caster.name} doesn't have enough skill points to cast ${skill.name}!`);
      return;
    }
    caster.stats.skillPoints -= skill.cost;

    switch (skill.effect) {
      case EffectType.heal: {
        const ch = target as Character;
        if (ch.dead) {
          caster.stats.skillPoints += skill.cost;
          this.uiService.pushText(`${target.name} is dead — they cannot be healed.`);
          return;
        }
        if (!ch.stats) {
          this.uiService.pushText(`${caster.name} tried to cast ${skill.name} on ${target.name}... That will not do.`);
          return;
        }
        const healAmount = Math.max(1, skill.power * caster.stats.wisdom);
        ch.stats.healthPoints = Math.min(ch.stats.healthPoints + healAmount, ch.stats.constitution);
        this.uiService.pushText(`${caster.name} cast ${skill.name} on ${target.name}, restoring ${healAmount} HP!`);
        const healInteraction = this.findInteraction(target.interactions, EffectType.heal);
        if (healInteraction) {
          this.uiService.pushText(healInteraction.text);
          this.resolveInteraction(target, EffectType.heal, healInteraction);
        }
        break;
      }
      case EffectType.resurrect: {
        const ch = target as Character;
        if (!ch.dead) {
          caster.stats.skillPoints += skill.cost;
          this.uiService.pushText(`${target.name} is still alive!`);
          return;
        }
        ch.dead = false;
        ch.stats.healthPoints = Math.floor(ch.stats.constitution / 2);
        this.uiService.pushText(`${caster.name} cast ${skill.name} — ${target.name} rises with ${ch.stats.healthPoints} HP!`);
        break;
      }
      default: {
        const interaction = this.findInteraction(target.interactions, skill.effect);
        if (interaction) {
          this.uiService.pushText(interaction.text);
          if (interaction.storyChildrenIds?.length) {
            interaction.storyChildrenIds.forEach((locationId: number) => {
              this.addToNextQuestlinePhase(locationId);
            });
          }
          this.resolveInteraction(target, skill.effect, interaction);
        } else {
          this.uiService.pushText(`${caster.name} tried to cast ${skill.name} on ${target.name}... That will not do.`);
        }
        break;
      }
    }
  }
}
