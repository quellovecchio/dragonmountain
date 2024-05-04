import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Observable, take } from 'rxjs';
import { FightManagerService } from '../../services/fight-manager.service';
import { Actor } from '../../model/Actors/Actor';
import { Character } from '../../model/Actors/Character';
import { PlayingCharacter } from '../../model/Actors/PlayingCharacter';
import { MatMenuTrigger } from '@angular/material/menu';
import { Skill } from '../../model/Skill';

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
    if (this.eRef.nativeElement.contains(event.target)) {
      this.contextMenuPosition.x = event.y;
      this.contextMenuPosition.y = event.x;
      this.openMenu();
    }
  }

  contextMenuPosition = { x: 0, y: 0 };

  fightManager: FightManagerService;

  @Input() fightData?: Character[] = [];
  @Input() partyData: PlayingCharacter[] = [];

  @ViewChildren('partyCharacter') partyCharacters!: QueryList<ElementRef>;
  @ViewChildren('enemyCharacter') enemyCharacters!: QueryList<ElementRef>;


  @Output() attackSignal = new EventEmitter<any>();
  @Output() useSkillSignal = new EventEmitter<{ skill: Skill, enemyIndex: number, enemy: Actor }>();

  selectedEnemyIndex?: number;
  selectedEnemy?: Actor;
  public currentAttackAnimation: string = '/assets/animations/slash.gif';

  constructor(fightManager: FightManagerService, private eRef: ElementRef, private changeDetector: ChangeDetectorRef) {
    this.fightManager = fightManager;
  }

  ngOnInit(): void {
    this.fightData = this.fightManager.enemies;
  }

  ngAfterViewInit() {
    this.startFightScene();
  }

  startFightScene() {
    setInterval(() => {
      Promise.all(this.partyCharacters.map((element) => {
        return this.aggroAndMove(element.nativeElement, this.enemyCharacters.toArray());
      })).then(() => {
        Promise.all(this.enemyCharacters.map((element) => {
          return this.aggroAndMove(element.nativeElement, this.partyCharacters.toArray());
        })).catch((error) => {
          console.error(error);
        });
      }).catch((error) => {
        console.error(error);
      });
    }, 1000);
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

  attack(enemyIndex: number, enemy: Actor) {
    // TODO change animation to represent the attack
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

    this.attackSignal.emit({ enemyIndex, enemy });
  }

  useSkillOn(skill: Skill, enemyIndex: number, enemy: Actor) {
    // TODO change animation to represent the attack
    const useSkillSignal$ = new Observable<void>((observer) => {
      this.useSkillSignal.subscribe(() => {
        observer.next();
        observer.complete();
      });
    });

    useSkillSignal$.subscribe(() => {
      // is the enemy defeated?
      if (this.fightManager.lastAttackKilled && this.fightData) {
        delete this.fightData![enemyIndex];
        this.fightData = this.fightData!.filter(item => item);
        this.fightManager.lastAttackKilled = false;
      }
    });
    this.useSkillSignal.emit({ skill: skill, enemyIndex: enemyIndex, enemy: enemy });
  }

  getBindedActor(index: number) {
    return this.fightManager.getEnemy(index);
  }

  setSelectedEnemy(enemy: Character, index: number) {
    this.selectedEnemy = enemy;
    this.selectedEnemyIndex = index;
  }

  getCurrentPlayerSkills(): { "skills": Skill[] } {
    return { "skills": this.fightManager.currentCharacter.skills };
  }

  aggroAndMove(actor: any, enemies: any[]): Promise<void> {
    return new Promise<void>((resolve) => {
      // Calculate the distance between the actor and each enemy
      const distances = enemies.map(enemy => this.calculateDistance(actor, enemy.nativeElement));

      // Find the index of the closest enemy
      const closestEnemyIndex = distances.indexOf(Math.min(...distances));

      // Get the closest enemy
      const closestEnemy = enemies[closestEnemyIndex];

      // Move towards the closest enemy
      this.moveTowards(actor, closestEnemy).then(() => {
        resolve();
      }).catch((error) => {
        console.error(error);
        resolve();
      });
    });
  }

  calculateDistance(actor: any, enemy: any): number {
    // Calculate the distance between two points using Pythagorean theorem
    const dx = actor.getBoundingClientRect().x - enemy.getBoundingClientRect().x;
    const dy = actor.getBoundingClientRect().y - enemy.getBoundingClientRect().y;
    return (Math.sqrt(dx * dx + dy * dy));
  }

  moveTowards(actor: any, target: any): Promise<void> {
    return new Promise<void>((resolve) => {      
      // Calculate the distance between the actor and the target
      const dx = target.nativeElement.getBoundingClientRect().x - actor.getBoundingClientRect().x;
      const dy = target.nativeElement.getBoundingClientRect().y - actor.getBoundingClientRect().y;

      // Calculate the angle between the actor and the target
      const angle = Math.atan2(dy, dx);

      // Calculate the new position of the actor
      const speed = 10; // TODO move speed for characters
      const distanceX = +(Math.cos(angle) * speed).toFixed(3);
      const distanceY = +(Math.sin(angle) * speed).toFixed(3);

      // Update the position of the actor
      actor.style.transform = `translate(${distanceX}px, ${distanceY}px)`;
      actor.getBoundingClientRect().x += distanceX;
      actor.getBoundingClientRect().y += distanceY; // Adjust the timeout value as needed

      resolve();
    });
  }

}