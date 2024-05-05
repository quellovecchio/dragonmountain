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

  public static FIGHT_CLOCK_SPEED = 50;

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
    this.calculateActorsStartingPositions();
    this.startFightScene();
  }

  calculateActorsStartingPositions() {
    // i'm not really sure if the order is right
    for (var i = 0; i < this.partyCharacters.length; i++) {
      this.partyData[i].fightPositionX = 20;
      this.partyData[i].fightPositionY = - 50 * (i - 1);
      console.log('name : ' + this.partyData[i].name + ' fightPositionX : ' + this.partyData[i].fightPositionX + ' fightPositionY : ' + this.partyData[i].fightPositionY + ' bottom: ' + this.partyCharacters.get(i)!.nativeElement.getBoundingClientRect().bottom + ' right: ' + this.partyCharacters.get(i)!.nativeElement.getBoundingClientRect().right);
    }
    for (i = this.enemyCharacters.length; i > 0; i--) {
      this.fightData![i - 1].fightPositionX = 300;
      this.fightData![i - 1].fightPositionY = - 50 * (i - 1);
      console.log('name : ' + this.fightData![i - 1].name + ' fightPositionX : ' + this.fightData![i - 1].fightPositionX + ' fightPositionY : ' + this.fightData![i - 1].fightPositionY + ' bottom: ' + this.enemyCharacters.get(i - 1)!.nativeElement.getBoundingClientRect().bottom + ' right: ' + this.enemyCharacters.get(i - 1)!.nativeElement.getBoundingClientRect().right);
    }
  }

  startFightScene() {
    setInterval(() => {
      for (var i = 0; i < this.partyCharacters.length; i++) {
        this.aggroAndMove(this.partyData[i], i, true, this.fightData!);
      }
      for (var i = 0; i < this.fightData!.length; i++) {
        this.aggroAndMove(this.fightData![i], i, false, this.partyData);
      }
    }, FightComponent.FIGHT_CLOCK_SPEED);
  }

  aggroAndMove(actor: Character, actorIndex: number, friendly: boolean, enemies: Character[]) {
    // Calculate the distance between the actor and each enemy
    const distances = enemies.map(enemy => this.calculateDistance(actor, enemy));

    // Find the index of the closest enemy
    const closestEnemyIndex = distances.indexOf(Math.min(...distances));

    // Get the closest enemy
    const closestEnemy = enemies[closestEnemyIndex];

    // Move towards the closest enemy
    this.moveTowardsOrAttack(actor, actorIndex, friendly, closestEnemy)
  }

  calculateDistance(actor: Character, enemy: Character): number {
    // Calculate the distance between two points using Pythagorean theorem
    const dx = actor.fightPositionX - enemy.fightPositionX;
    const dy = actor.fightPositionY - enemy.fightPositionY;
    return (Math.sqrt(dx * dx + dy * dy));
  }

  moveTowardsOrAttack(actor: Character, actorIndex: number = 0, friendly: boolean, target: Character) {
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log('actor: ' + actor.name + ' - target ' + target.name);
    // Calculate the distance between the actor and the target
    const dx = target.fightPositionX - actor.fightPositionX;
    const dy = target.fightPositionY - actor.fightPositionY;
    console.log(actor.name + ' - dx: ' + dx + ' -  dy: ' + dy);

    if (Math.abs(dx) < actor.attackRange && Math.abs(dy) < actor.attackRange) {
      console.log('actor decided to attack');
      if(actor.attackCooldown > 0) {
        console.log('...but his cooldown is yet to be resolved');
        actor.attackCooldown -= FightComponent.FIGHT_CLOCK_SPEED;
        console.log('cooldown left: ' + actor.attackCooldown);
      } else {
        let damage = this.fightManager.processAttack(actor, target, false);
        actor.attackCooldown -= FightComponent.FIGHT_CLOCK_SPEED;
        console.log('damage dealt: ' + damage);
      }
    } else {
      console.log('actor decided to move');
      // Calculate the angle between the actor and the target
      const angle = Math.atan2(dy, dx);

      // Calculate the new position of the actor
      const speed = 4; // TODO move speed different for each character
      const distanceX = +(Math.cos(angle) * speed).toFixed(3);
      const distanceY = +(Math.sin(angle) * speed).toFixed(3);
      console.log(actor.name + ' - distance to cover x ' + distanceX + ' -  distance to cover y ' + distanceY);
      console.log('current X position: ' + actor.fightPositionX + ' - current Y position:  ' + actor.fightPositionY);
      if (actor.fightPositionX + distanceX < 400 && actor.fightPositionX + distanceX > 0 && actor.fightPositionY + distanceY < 200 && actor.fightPositionY + distanceY > -200) {
        // Update the position of the actor
        actor.fightPositionX += distanceX;
        actor.fightPositionY += distanceY; // Adjust the timeout value as needed
        console.log('updated X position: ' + actor.fightPositionX + ' - updated Y position:  ' + actor.fightPositionY);
        if (friendly)
          this.partyCharacters.get(actorIndex)!.nativeElement.style.transform = `translate(${actor.fightPositionX + distanceX}px, ${actor.fightPositionY + distanceY}px)`;
        else
          this.enemyCharacters.get(actorIndex)!.nativeElement.style.transform = `translate(${(actor.fightPositionX + distanceX)}px, ${actor.fightPositionY + distanceY}px)`;
      } else {
        console.log('position not updated: trying to reach out of bounds area');
      }
    }
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
  }













  // OLDER CODE reuse or cleanup

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

}