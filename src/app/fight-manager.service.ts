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

  calculateDamage(character: Character) {
    return 10;
  }

  isBattleOver() {
    return (this.enemies.reduce((sum, current) => sum + current.stats.healthPoints, 0) <= 0);
  }

  endFight() {
    this.fighting = false;
  }
}
