import { Injectable } from '@angular/core';
import { Character } from './model/Actors/Character';
import { PlayingCharacter } from './model/Actors/PlayingCharacter';

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

  constructor() { }

  startFight(enemies: Character[], party: PlayingCharacter[]) {
    this.fighting = true;
    this.enemies = enemies;
    this.party = party;
    // Map enemies and party into turnRotation
    this.turnRotation = this.generateTurnRotation();
    this.resumeFightLoop();
  }

  resumeFightLoop() {
    while(this.isEnemyTurn && this.fighting) {
      while(this.nextTurnBuffer.length == 0) {
        this.nextTurnBuffer = this.getNextTurnCharacter();
      }
      this.currentCharacter = this.nextTurnBuffer.pop()!;
      this.isEnemyTurn = this.nextTurn();
    }
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
    const randomAllyIndex = Math.floor(Math.random() * this.party.length);
    var defendingCharacter = this.party[randomAllyIndex];
    console.log("the enemy is attacking " + defendingCharacter.name);
    this.processAttack(attackingCharacter, defendingCharacter);
    //this.resumeFighLoop();
  }

  processAttack(attackingCharacter: Character, defendingCharacter: Character) {
    // step 1: calulate damage
    var damage = this.calculateDamage(attackingCharacter, defendingCharacter);
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
        delete this.party[characterIndex];
        this.party = this.party.filter(item => item);
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

  calculateDamage(attackingCharacter: Character, defendingCharacter: Character) {
    // TODO include in damage calculation equipment and handle magic damage
    console.log("damage: " + attackingCharacter.stats.strength);
    return attackingCharacter.stats.strength;
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
        console.log("==============================");
        console.log("character found: " + this.turnRotation[i].character.name);
        console.log("==============================");
        this.turnRotation[i].speedValue = this.turnRotation[i].speedValue - 100;
        //nextCharacter = this.turnRotation[i].character;
        newBuffer.push(this.turnRotation[i].character);
      }
      console.log("data after " + i + ": " + JSON.stringify(this.turnRotation.map(el => { return el.character.name + ' - ' + el.speedValue })));
    }
    console.log("============RESULT============");
    console.log(JSON.stringify(newBuffer.map(el => { return el.name })));
    return newBuffer;
  }

  isBattleOver() {
    return (this.enemies.reduce((sum, current) => sum + current.stats.healthPoints, 0) <= 0);
  }

  endFight() {
    this.fighting = false;
  }
}
