import { Injectable } from '@angular/core';
import { Character } from './model/Actors/Character';
import { PlayingCharacter } from './model/Actors/PlayingCharacter';

@Injectable({
  providedIn: 'root'
})
export class FightManagerService {

  enemies: Character[] = [];
  party: PlayingCharacter[] = [];
  fighting: boolean = false;
  currentCharacter: PlayingCharacter = new PlayingCharacter();

  //did last attack kill the enemy?
  public lastAttackKilled: boolean = false;

  constructor() { }

  startFight(enemies: Character[], party: PlayingCharacter[]) {
    this.fighting = true;
    this.enemies = enemies;
    this.party = party;
    this.currentCharacter = this.nextTurn();
  }

  getEnemy(enemyIndex: number) {
    return this.enemies[enemyIndex];
  }

  nextTurn() {
    // TODO calculate next player using speed stats
    // TODO enemy actions
    return this.party[0];
  }

  processAttack(enemyIndex: number) {
    this.lastAttackKilled = false;
    let updatedEnemy = this.enemies[enemyIndex];
    let updatedHealthPoints = updatedEnemy.stats.healthPoints - this.calculateDamage(updatedEnemy);
    if(updatedHealthPoints > 0) {
      // TODO to swap with current health points (stats gives you the maximum)
      updatedEnemy.stats.healthPoints = updatedEnemy.stats.healthPoints - this.calculateDamage(updatedEnemy);
      this.enemies[enemyIndex] = updatedEnemy;
    }
    else {
      this.lastAttackKilled = true;
      delete this.enemies[enemyIndex];
      this.enemies = this.enemies.filter(item => item);
    }
    return this.calculateDamage(updatedEnemy);
  }

  calculateDamage(character: Character) {
    // TODO real damage calculation
    return 10;
  }

  isBattleOver() {
    return (this.enemies.reduce((sum, current) => sum + current.stats.healthPoints, 0) <= 0);
  }

  endFight() {
    this.fighting = false;
  }
}
