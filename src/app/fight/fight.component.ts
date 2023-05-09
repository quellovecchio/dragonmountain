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

  @Input() fightData?: Actor[] = [];
  @Input() partyData: PlayingCharacter[] = [];

  @Output() attackSignal = new EventEmitter<any>();
  
  constructor(fightManager: FightManagerService) { 
    this.fightManager = fightManager;
  }

  ngOnInit(): void {
    this.fightData = this.fightManager.enemies;
  }

  attack(actor: Actor) {

    const attackSignal$ = new Observable<void>((observer) => {
      this.attackSignal.subscribe(() => {
        observer.next();
        observer.complete();
      });
    });

    attackSignal$.subscribe(() => {
      // is the enemy defeated?
      if(this.fightManager.enemies.findIndex((enemy) => enemy.name == actor.name) == -1) {
        this.fightData = this.fightData?.filter(item => item);
        let i = this.fightData?.findIndex((enemy) => enemy.name == actor.name);
        if(this.fightData && i)
        delete this.fightData[i];
      }
    });

    this.attackSignal.emit(actor);
  }

  // duped code, TODO implement interface with method
  getActorWidth(): number {
    if (this.fightData?.length == 3) {
       return 33;
    } else if (this.fightData?.length == 2) {
      return 50;
    } else {
      return 100;
    }
  }
}