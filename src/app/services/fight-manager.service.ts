import { Injectable } from '@angular/core';
import { Character } from '../model/Actors/Character';
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';
import { ItemService } from './item.service';
import { Constants } from 'src/assets/constants';
import { ViewportService } from '../game/viewport/viewport.service';
import { RunService } from './run.service';
import { Skill } from '../model/Skill';
import { FightComponent } from '../game/fight/fight.component';

@Injectable({
  providedIn: 'root'
})
export class FightManagerService {

  public enemies: Character[] = [];
  party: PlayingCharacter[] = [];
  fighting: boolean = false;

  constructor(private itemService: ItemService, private viewportService: ViewportService, private runService: RunService) { }

  startFight(enemies: Character[], party: PlayingCharacter[]) {
    this.fighting = true;
    enemies.forEach(enemy => enemy.class = this.runService.getClassById(enemy.classId));
    this.enemies = enemies;
    this.party = party;
    // Map enemies and party into turnRotation
    //this.turnRotation = this.generateTurnRotation();
    //this.resumeFightLoop();
  }

  processAttack(attackingCharacter: Character, defendingCharacter: Character, magical: boolean): { damage: number, killed: boolean } {
    if (defendingCharacter) {
      // step 1: calulate damage
      console.log(attackingCharacter.name + " is attacking " + defendingCharacter.name);
      var killed = false;
      var damage = this.calculateDamage(attackingCharacter, defendingCharacter, magical);
      var updatedCharacter = defendingCharacter;
      var updatedHealthPoints = updatedCharacter.stats.healthPoints - damage;
      if (this.party.findIndex(el => { return el.name == defendingCharacter.name }) >= 0) {
        // update character in the party
        if (updatedHealthPoints > 0) {
          console.log("updated health points: " + updatedHealthPoints);
          this.party.map((el) => { if (el.name == defendingCharacter.name) el.stats.healthPoints = updatedHealthPoints });
      }
      else {
        console.log("target killed");
        killed = true;
        this.party.map((el) => { if (el.name == defendingCharacter.name) { el.stats.healthPoints = 0; el.dead = true } });
      }
    } else {
      //update character in enemy party
      // TODO VERY SERIOUS BUG if enemies are the same kind of enemy it fucks up everything
      if (updatedHealthPoints > 0) {
        this.enemies.map((el) => { if (el.id == defendingCharacter.id) el.stats.healthPoints = updatedHealthPoints });
      }
      else {
        killed = true;
        this.enemies.map((el) => { if (el.id == defendingCharacter.id) { el.stats.healthPoints = 0; el.dead = true } });
        if (this.isBattleOver())
          this.endFight();
      }
    }
    // go on finding next character in turn
    //this.currentCharacter = this.getNextTurnCharacter()? this.currentCharacter : this.currentCharacter;
    return { damage: damage, killed: killed };
  }
    // game over
    this.endFight();
return { damage: 0, killed: false };
  }

calculateDamage(attackingCharacter: Character, defendingCharacter: Character, magical: boolean) {
  var baseDamage: number = 0;
  var attackBuff: number = 0;
  var defenseBuff: number = 0;
  var finalDamage: number = 0;
  if (magical) {
    baseDamage = attackingCharacter.stats.wisdom;
    finalDamage = baseDamage + attackBuff - defenseBuff;
  } else {
    baseDamage = attackingCharacter.stats.strength;
    attackBuff = this.itemService.calculateAttackBuff(attackingCharacter);
    defenseBuff = this.itemService.calculateDefenseBuff(defendingCharacter);
    finalDamage = baseDamage + attackBuff - defenseBuff;
  }
  if (Constants.DAMAGE_LOGGING) {
    console.log("actor attack: " + attackingCharacter.stats.strength);
    console.log("attack buff: " + attackBuff);
    console.log("defense buff: " + defenseBuff);
    console.log("final damage: " + finalDamage + " - rounded to one? " + ((finalDamage <= 0) ? 'Y' : 'N'));
  }
  // rule: 0 or negative damage gets rounded to 1
  return finalDamage <= 0 ? 1 : finalDamage;
}

deductSkillPoints(character: Character, skill: Skill): boolean {
  // returns false if spell can't be launched
  if (character.stats.skillPoints - skill.cost >= 0) {
    character.stats.skillPoints = character.stats.skillPoints - skill.cost;
    return true;
  } else
    return false;
}

getEnemy(enemyIndex: number) {
  return this.enemies[enemyIndex];
}

isBattleOver() {
  return (this.enemies.reduce((sum, current) => sum + current.stats.healthPoints, 0) <= 0);
}

endFight() {
  this.fighting = false;
  this.enemies = [];
  this.party = [];
}
}
