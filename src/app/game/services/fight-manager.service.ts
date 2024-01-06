import { Injectable } from '@angular/core';
import { Character } from '../../model/Actors/Character';
import { PlayingCharacter } from '../../model/Actors/PlayingCharacter';
import { ItemService } from './item.service';
import { Constants } from 'src/assets/constants';
import { ViewportService } from '../viewport/viewport.service';
import { RunService } from './run.service';
import { Skill } from '../../model/Skill';

@Injectable({
  providedIn: 'root'
})
export class FightManagerService {

  public enemies: Character[] = [];
  party: PlayingCharacter[] = [];
  public turnRotation: { character: Character, speedValue: number }[] = [];
  fighting: boolean = false;
  isEnemyTurn: boolean = true;
  currentCharacter: Character = new Character();
  nextTurnBuffer: Character[] = []; // if more chars clock at the same time, gets stored in buffer

  //did last attack kill the enemy?
  public lastAttackKilled: boolean = false;

  constructor(private itemService: ItemService, private viewportService: ViewportService, private runService: RunService) { }

  startFight(enemies: Character[], party: PlayingCharacter[]) {
    this.fighting = true;
    enemies.forEach(enemy => enemy.class = this.runService.getClassById(enemy.classId));
    this.enemies = enemies;
    this.party = party;
    // Map enemies and party into turnRotation
    this.turnRotation = this.generateTurnRotation();
    this.resumeFightLoop();
  }

  resumeFightLoop() {
    while (this.isEnemyTurn && this.fighting) {
      while (this.nextTurnBuffer.length == 0) {
        this.nextTurnBuffer = this.getNextTurnCharacter();
      }
      this.currentCharacter = this.nextTurnBuffer.pop()!;
      this.isEnemyTurn = this.nextTurn();
    }
    this.viewportService.pushText("Now it's " + this.currentCharacter.name + "'s turn. What will be his next Action?");
  }

  generateTurnRotation() {
    return [
      ...this.enemies.map(enemy => ({ character: enemy, speedValue: 0 })),
      ...this.party.map(player => ({ character: player, speedValue: 0 }))
    ];
  }

  nextTurn() {
    if (!this.enemies.includes(this.currentCharacter)) {
      return false;
    }
    else {
      this.generateAiTurn(this.currentCharacter);
      return true;
    }
  }

  generateAiTurn(attackingCharacter: Character) {
    // extract random player from part to be attacked
    // TODO implement skills on ai turn
    const randomAllyIndex = Math.floor(Math.random() * this.party.length);
    var defendingCharacter = this.party[randomAllyIndex];
    let damage = this.processAttack(attackingCharacter, defendingCharacter, false);
    this.viewportService.pushText("The enemy is attacking!");
    this.viewportService.pushText(defendingCharacter.name + " gets " + damage + " points of damage!");
    //this.resumeFighLoop();
  }

  processAttack(attackingCharacter: Character, defendingCharacter: Character, magical: boolean) {
    if (defendingCharacter) {
      // step 1: calulate damage
      console.log(attackingCharacter.name + " is attacking " + defendingCharacter.name);
      var damage = this.calculateDamage(attackingCharacter, defendingCharacter, magical);
      var updatedCharacter = defendingCharacter;
      var updatedHealthPoints = updatedCharacter.stats.healthPoints - damage;
      if (this.party.findIndex(el => { return el == defendingCharacter }) >= 0) {
        // update character in the party
        var characterIndex = this.party.findIndex(el => { return el == defendingCharacter });
        if (updatedHealthPoints > 0) {
          updatedCharacter.stats.healthPoints = updatedHealthPoints;
          console.log("updated health points: " + updatedHealthPoints)
          this.party[characterIndex] = updatedCharacter as PlayingCharacter;
        }
        else {
          this.lastAttackKilled = true;
          this.party[characterIndex].dead = true;
        }
      } else {
        //update character in enemy party
        var characterIndex = this.enemies.findIndex(el => { return el == defendingCharacter });
        if (updatedHealthPoints > 0) {
          updatedCharacter.stats.healthPoints = updatedHealthPoints;
          this.enemies[characterIndex] = updatedCharacter;
        }
        else {
          this.lastAttackKilled = true;
          delete this.enemies[characterIndex];
          this.enemies = this.enemies.filter(item => item);
          if (this.isBattleOver())
            this.endFight();
        }
      }
      // go on finding next character in turn
      //this.currentCharacter = this.getNextTurnCharacter()? this.currentCharacter : this.currentCharacter;
      return damage;
    }
    // game over
    this.endFight(); 
    return 0;
  }

  calculateDamage(attackingCharacter: Character, defendingCharacter: Character, magical: boolean) {
    var baseDamage: number = 0;
    var attackBuff: number = 0;
    var defenseBuff: number = 0;
    var finalDamage: number = 0;
    if(magical) {
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

  deductSkillPoints(skill: Skill): boolean {
    // returns false if spell can't be launched
    if(this.currentCharacter.stats.skillPoints - skill.cost >= 0) {
      this.currentCharacter.stats.skillPoints = this.currentCharacter.stats.skillPoints - skill.cost;
      return true;
    } else 
    return false;
  }

  getEnemy(enemyIndex: number) {
    return this.enemies[enemyIndex];
  }

  getNextTurnCharacter() {
    var newBuffer: Character[] = [];
    // updates the speedValue of a character by adding its speed value until someones value is 100
    for (let i = 0; i < this.turnRotation.length; i++) {
      this.turnRotation[i].speedValue = this.turnRotation[i].speedValue + this.turnRotation[i].character.stats.dexterity;
      if (this.turnRotation[i].speedValue >= 100 && (this.enemies.includes(this.turnRotation[i].character) || this.party.includes(this.turnRotation[i].character as PlayingCharacter))) {
        if (Constants.TURN_LOGGING) {
          console.log("==============================");
          console.log("character found: " + this.turnRotation[i].character.name);
          console.log("==============================");
        }
        this.turnRotation[i].speedValue = this.turnRotation[i].speedValue - 100;
        //nextCharacter = this.turnRotation[i].character;
        newBuffer.push(this.turnRotation[i].character);
      }
      if (Constants.TURN_LOGGING)
        console.log("data after " + i + ": " + JSON.stringify(this.turnRotation.map(el => { return el.character.name + ' - ' + el.speedValue })));
    }
    if (Constants.TURN_LOGGING) {
      console.log("============RESULT============");
      console.log(JSON.stringify(newBuffer.map(el => { return el.name })));
    }
    return newBuffer;
  }

  isBattleOver() {
    return (this.enemies.reduce((sum, current) => sum + current.stats.healthPoints, 0) <= 0);
  }

  endFight() {
    this.fighting = false;
    this.enemies = [];
    this.party = [];
    this.currentCharacter = new Character();
    this.turnRotation = [];
    this.nextTurnBuffer = [];
  }
}
