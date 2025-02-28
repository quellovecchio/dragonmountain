import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Observable, take } from 'rxjs';
import { FightManagerService } from '../../services/fight-manager.service';
import { Actor } from '../../model/Actors/Actor';
import { Character } from '../../model/Actors/Character';
import { PlayingCharacter } from '../../model/Actors/PlayingCharacter';
import { MatMenuTrigger } from '@angular/material/menu';
import { Skill } from '../../model/Skill';
import { Constants } from 'src/assets/constants';
import { DataService } from 'src/app/data.service';
import { UiService } from '../ui-layer/ui.service';
import { MusicService } from 'src/app/services/music.service';

class FightAnimation {
  source: string = '';
  duration: number = 0;
  id: number = 0;
  x: number = 0;
  y: number = 0;
  rotationAngle: number = 0;
}

const RAND_SEED = 50;

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
  fightSpeed: number = this.dataService.getSettings().fightSpeed;


  @ViewChildren('partyCharacter') partyCharacters!: QueryList<ElementRef>;
  @ViewChildren('enemyCharacter') enemyCharacters!: QueryList<ElementRef>;
  animations: FightAnimation[] = [];

  @ViewChild('battlefield') battlefield!: ElementRef;
  battlefieldWidth = 0;
  battlefieldHeight = 0;

  @Output() useSkillSignal = new EventEmitter<{ skill: Skill, enemyIndex: number, enemy: Actor }>();

  selectedEnemyIndex?: number;
  selectedEnemy?: Actor;
  public currentAttackAnimation: string = '/assets/animations/slash.gif';

  constructor(fightManager: FightManagerService, private eRef: ElementRef, private dataService: DataService, private uiService: UiService, private musicService: MusicService) {
    this.fightManager = fightManager;
  }

  ngOnInit(): void {
    this.fightData = this.fightManager.enemies;
  }

  ngAfterViewInit() {
    this.battlefieldWidth = this.battlefield.nativeElement.offsetWidth;
    this.battlefieldHeight = this.battlefield.nativeElement.offsetHeight;
    this.calculateActorsStartingPositions();
    this.startFightScene();
  }

  getRandomicity() {
    return Math.floor(Math.random() * (RAND_SEED - (RAND_SEED * -1) + 1)) + (RAND_SEED * -1)
  }

  calculateActorsStartingPositions() {
    let scaleFactor = window.innerWidth < 600 ? 1.5 : 1;
    for (var i = 0; i < this.partyCharacters.length; i++) {
      this.partyData[i].fightPositionX = (this.battlefieldWidth * 0.2) + this.getRandomicity();
      this.partyData[i].fightPositionY = 0 - (this.battlefieldHeight / 1.7 * scaleFactor) + (50 * i) + this.getRandomicity();
      console.log('name : ' + this.partyData[i].name + ' fightPositionX : ' + this.partyData[i].fightPositionX + ' fightPositionY : ' + this.partyData[i].fightPositionY + ' bottom: ' + this.partyCharacters.get(i)!.nativeElement.getBoundingClientRect().bottom + ' right: ' + this.partyCharacters.get(i)!.nativeElement.getBoundingClientRect().right);
    }
    for (var j = 0; j < this.enemyCharacters.length; j++) {
      this.fightData![j].fightPositionX = (this.battlefieldWidth * 0.8) + this.getRandomicity();
      this.fightData![j].fightPositionY = 0 - (this.battlefieldHeight / 1.7 * scaleFactor) + (50 * j) + this.getRandomicity();
      console.log('name : ' + this.fightData![j].name + ' fightPositionX : ' + this.fightData![j].fightPositionX + ' fightPositionY : ' + this.fightData![j].fightPositionY + ' bottom: ' + this.enemyCharacters.get(j)!.nativeElement.getBoundingClientRect().bottom + ' right: ' + this.enemyCharacters.get(j)!.nativeElement.getBoundingClientRect().right);
    }
  }

  fightSpeedCurve(x: number): number {
    const m = -0.941;
    const b = 95.1;
    return m * x + b;
  }

  startFightScene() {
    if(window.innerWidth < 600) {
      this.uiService.closeShop(false);
      this.uiService.closeInventory();
    }
    const intervalId = setInterval(() => {
      if (this.fightManager.isBattleOver()) {
        clearInterval(intervalId);
      }
      for (var i = 0; i < this.partyCharacters.length; i++) {
        if (!this.partyData[i].dead)
          this.aggroAndMove(this.partyData[i], i, true, this.fightData!);
      }
      for (var i = 0; i < this.fightData!.length; i++) {
        if (!this.fightData![i].dead)
          this.aggroAndMove(this.fightData![i], i, false, this.partyData);
      }
    }, this.fightSpeedCurve(this.fightSpeed));
  }

  aggroAndMove(actor: Character, actorIndex: number, friendly: boolean, enemies: Character[]) {
    if (enemies.length === 0)
      return;
    // Calculate the distance between the actor and each enemy
    const distances = enemies.map(enemy => {
      if (!enemy.dead)
        return this.calculateDistance(actor, enemy)
      return 9999;
    });

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
    // Calculate the angle between the actor and the target
    const angle = Math.atan2(dy, dx);
    console.log(actor.name + ' - dx: ' + dx + ' -  dy: ' + dy, ' - angle: ' + angle);

    if (Math.abs(dx) < actor.attackRange && Math.abs(dy) < actor.attackRange) {
      console.log('actor decided to attack');
      if (actor.actualAttackCooldown >= 0) {
        console.log('...but his cooldown is yet to be resolved');
        actor.actualAttackCooldown -= this.fightSpeed;
        console.log('cooldown left: ' + actor.actualAttackCooldown);
      } else {
        // attack animations
        this.musicService.playSound('attack');
        target.damaged = true;
        setTimeout(() => {
          target.damaged = false;
        }, 500);
        // todo insert source and duration of the animation basing on attack
        var attackAnimation: FightAnimation = {
          source: '/assets/animations/slash.gif',
          duration: 200,
          id: this.animations.length,
          x: target.fightPositionX,
          y: target.fightPositionY,
          rotationAngle: angle,
        }
        this.animations.push(attackAnimation);
        setTimeout(() => {
          let r = this.animations.filter(animation => animation.id !== attackAnimation.id);
          this.animations = this.animations.filter(animation => animation.id !== attackAnimation.id);
        }, 300);

        let attackData = this.fightManager.processAttack(actor, target, false);
        actor.actualAttackCooldown = actor.attackCooldown;
        console.log('damage dealt: ' + attackData.damage);
        if (attackData.killed && this.fightData!.length > 0 && this.partyData.length > 0) {
          if (!friendly) {
            this.partyData[actorIndex].dead = true;
          } else {
            this.fightData![actorIndex].dead = true;
          }
        }
      }
    } else {
      console.log('actor decided to move');
      // Calculate the new position of the actor
      const speed = 4; // TODO move speed different for each character
      const distanceX = +(Math.cos(angle) * speed).toFixed(3);
      const distanceY = +(Math.sin(angle) * speed).toFixed(3);
      console.log(actor.name + ' - distance to cover x ' + distanceX + ' -  distance to cover y ' + distanceY);
      console.log('current X position: ' + actor.fightPositionX + ' - current Y position:  ' + actor.fightPositionY);
      //if (actor.fightPositionX + distanceX < this.battlefieldWidth && actor.fightPositionX + distanceX > 0 && actor.fightPositionY + distanceY < (this.battlefieldHeight/2) && actor.fightPositionY + distanceY > (this.battlefieldHeight/2*-1)) {
      // Update the position of the actor
      actor.fightPositionX += distanceX;
      actor.fightPositionY += distanceY; // Adjust the timeout value as needed
      console.log('updated X position: ' + actor.fightPositionX + ' - updated Y position:  ' + actor.fightPositionY);
      if (friendly)
        this.partyCharacters.get(actorIndex)!.nativeElement.style.transform = `translate(${actor.fightPositionX + distanceX}px, ${actor.fightPositionY + distanceY}px)`;
      else
        this.enemyCharacters.get(actorIndex)!.nativeElement.style.transform = `translate(${(actor.fightPositionX + distanceX)}px, ${actor.fightPositionY + distanceY}px)`;
      //} else {
      //  console.log('position not updated: trying to reach out of bounds area');
      //}
    }
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
  }

  getAnimationTransform(animation: FightAnimation) {
    return 'translate(' + (animation.x) + 'px, ' + (animation.y - 530) + 'px) rotate(' + animation.rotationAngle + 'rad)';
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
}