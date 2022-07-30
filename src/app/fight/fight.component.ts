import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
    this.attackSignal.emit(actor);
  }

}
