import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Observable, take } from 'rxjs';
import { FightManagerService } from '../fight-manager.service';
import { Actor } from '../model/Actors/Actor';
import { Character } from '../model/Actors/Character';
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';
import { MatMenuTrigger } from '@angular/material/menu';
import { Skill } from '../model/Skill';

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.scss']
})
export class FightComponent implements OnInit {

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger | undefined;

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // check if the click is inside the box
    if(this.eRef.nativeElement.contains(event.target)) {
      this.contextMenuPosition.x = event.y;
      this.contextMenuPosition.y = event.x;
      this.openMenu();
    }
  }

  contextMenuPosition = {x: 0, y: 0};

  fightManager: FightManagerService;

  @Input() fightData?: Character[] = [];
  @Input() partyData: PlayingCharacter[] = [];

  @Output() attackSignal = new EventEmitter<any>();
  @Output() useSkillSignal = new EventEmitter<{skill: Skill, enemyIndex: number}>();

  selectedEnemyIndex?: number;

  constructor(fightManager: FightManagerService, private eRef: ElementRef) {
    this.fightManager = fightManager;
  }

  ngOnInit(): void {
    this.fightData = this.fightManager.enemies;
  }

  openMenu() {
    this.menuTrigger?.menuOpened.pipe(take(1)).subscribe(() => {
      const menu = document.getElementsByClassName('location-menu')[0] as HTMLElement;
      menu.focus();
      menu.style.position = 'absolute';
      menu.style.top = `${this.contextMenuPosition.x}px`;
      menu.style.left = `${this.contextMenuPosition.y}px`;
    });

    this.menuTrigger?.openMenu();
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
        delete this.fightData![enemyIndex];
        this.fightData = this.fightData!.filter(item => item);
        this.fightManager.lastAttackKilled = false;
      }
    });

    this.attackSignal.emit(enemyIndex);
  }

  useSkillOn(skill: Skill, enemyIndex: number) {
    /*const attackSignal$ = new Observable<void>((observer) => {
      this.attackSignal.subscribe(() => {
        observer.next();
        observer.complete();
      });
    });

    attackSignal$.subscribe(() => {
      // is the enemy defeated?
      if (this.fightManager.lastAttackKilled && this.fightData) {
        delete this.fightData![enemyIndex];
        this.fightData = this.fightData!.filter(item => item);
        this.fightManager.lastAttackKilled = false;
      }
    });*/

    this.useSkillSignal.emit({skill: skill, enemyIndex: enemyIndex});
  }

  getBindedActor(index: number) {
    return this.fightManager.getEnemy(index);
  }

  setSelectedEnemyIndex(index: number) {
    this.selectedEnemyIndex = index;
  }

  getCurrentPlayerSkills(): {"skills": Skill[]} {
    return {"skills": this.fightManager.currentCharacter.skills};
  }
}