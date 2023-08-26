import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { FightManagerService } from '../fight-manager.service';
import { Actor } from '../model/Actors/Actor';
import { Character } from '../model/Actors/Character';
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.scss']
})
export class FightComponent implements OnInit {

  fightManager: FightManagerService;

  @Input() fightData?: Character[] = [];
  @Input() partyData: PlayingCharacter[] = [];

  @Output() attackSignal = new EventEmitter<any>();
  

  constructor(fightManager: FightManagerService) {
    this.fightManager = fightManager;
  }

  ngOnInit(): void {
    this.fightData = this.fightManager.enemies;
  }

  attack(enemyIndex: number) {
    const attackSignal$ = new Observable<void>((observer) => {
      this.attackSignal.subscribe(() => {
        observer.next();
        observer.complete();
      });
    });

    attackSignal$.subscribe(() => {
      // is the enemy defeated?
      if (this.fightManager.lastAttackKilled && this.fightData) {
        delete this.fightData[enemyIndex];
        this.fightData = this.fightData.filter(item => item);
      }
    });

    this.attackSignal.emit(enemyIndex);
  }

  getBindedActor(index: number) {
    return this.fightManager.getEnemy(index);
  }

  // duped code, TODO implement interface with method
  getActorWidth(): number {
    if (this.fightData?.length == 3) {
      return 32;
    } else if (this.fightData?.length == 2) {
      return 49;
    } else {
      return 99;
    }
  }
}