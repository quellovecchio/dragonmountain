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

  constructor() { }

  startFight(enemies: Character[], party: PlayingCharacter[]) {
    this.fighting = true;
    this.enemies = enemies;
    this.party = party;
    this.currentCharacter = this.nextTurn();
  }

  nextTurn() {
    // TODO calculate next player using speed stats
    // TODO enemy actions
    return this.party[0];
  }

  processAttack(character: Character) {
    // TODO change name with id for filtering
    let itemIndex = this.enemies.findIndex(item => item.name == character.name);
    let updatedEnemy = this.enemies[itemIndex];
    let updatedHealthPoints = updatedEnemy.stats.healthPoints - this.calculateDamage(character);
    if(updatedHealthPoints > 0) {
      // TODO to swap with current health points (stats gives you the maximum)
      updatedEnemy.stats.healthPoints = updatedEnemy.stats.healthPoints - this.calculateDamage(character);
      this.enemies[itemIndex] = updatedEnemy;
    }
    else {
      delete this.enemies[itemIndex];
      this.enemies = this.enemies.filter(item => item);
    }
    return this.calculateDamage(character);
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
