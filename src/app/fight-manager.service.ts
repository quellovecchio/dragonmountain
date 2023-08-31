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
  isEnemyTurn: boolean = false;
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
    this.turnRotation = [
      ...this.enemies.map(enemy => ({ character: enemy, speedValue: 0 })),
      ...this.party.map(player => ({ character: player, speedValue: 0 }))
    ];
    this.firstTurn();
  }

  firstTurn() {
    var nextTurnCharacter = this.getNextTurnCharacter();
    this.currentCharacter = nextTurnCharacter!;
    if (!this.enemies.includes(this.currentCharacter)) {
      this.isEnemyTurn = false;
      this.currentCharacter = nextTurnCharacter ? nextTurnCharacter : new Character();
    }
    else {
      this.isEnemyTurn = true;
      this.generateAiTurn(this.currentCharacter);
    }
  }

  nextTurn() {
    if(this.nextTurnBuffer.length > 0) {
      this.currentCharacter = this.nextTurnBuffer.pop()!; 
    } else {
      this.currentCharacter = this.getNextTurnCharacter()!;
    }
    // handle turn if is enemy turn
    if (this.enemies.includes(this.currentCharacter)) {
      // enemy does turn!
      this.isEnemyTurn = true;
      this.generateAiTurn(this.currentCharacter);
    } else
      this.isEnemyTurn = false;
  }

  generateAiTurn(attackingCharacter: Character) {
    // extract random player from part to be attacked
    const randomAllyIndex = Math.floor(Math.random() * this.party.length);
    var defendingCharacter = this.party[randomAllyIndex];
    console.log("the enemy is attacking " + defendingCharacter.name);
    this.processAttack(attackingCharacter, defendingCharacter);
    this.nextTurn();
  }

  processAttack(attackingCharacter: Character, defendingCharacter: Character) {
    // step 1: calulate damage
    var damage = this.calculateDamage(attackingCharacter, defendingCharacter);
    var updatedCharacter = defendingCharacter;
    var updatedHealthPoints = updatedCharacter.stats.healthPoints -= damage;
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
        // TODO: handle game over: if there are no characters left -Z GAME OVER
        if(this.party.length == 0)
          console.log("game over");
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
        // TODO: handle game over: if there are no characters left -Z GAME OVER
        this.enemies = this.enemies.filter(item => item);
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

  getNextTurnCharacter(): Character | undefined {
    // updates the speedValue of a character by adding its speed value until someones value is 100
    var nextCharacter: Character | undefined = undefined;
    var characterFound = false;
    while (!characterFound) {
      this.turnRotation.forEach(el => {
        el.speedValue = el.speedValue + el.character.stats.dexterity;
        if (el.speedValue >= 100) {
          console.log("character found: " + el.character.name);
          el.speedValue = el.speedValue - 100;
          nextCharacter = el.character;
          if(characterFound == true) {
          console.log("... and put into buffer");
            this.nextTurnBuffer.push(el.character);
          }
          characterFound = true;
        }
      });
    }
    return nextCharacter;
  }

  isBattleOver() {
    return (this.enemies.reduce((sum, current) => sum + current.stats.healthPoints, 0) <= 0);
  }

  endFight() {
    this.fighting = false;
  }
}
