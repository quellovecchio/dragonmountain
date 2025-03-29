import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { fromEvent, Observable, Subscription, take } from 'rxjs';
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

export type FightAction = {
  actionType: '' | 'attack' | 'spell'
}

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

  // fight constants
  distanceMultiplier = 65;



  fightStartAnimation: boolean = true;

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger | undefined;
  @ViewChild('range') range: HTMLElement | undefined;

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
  battleFieldClicked: Subscription = new Subscription();

  @Output() useSkillSignal = new EventEmitter<{ skill: Skill, enemyIndex: number, enemy: Actor }>();

  selectedEnemyIndex?: number;
  selectedEnemy?: Actor;
  public currentAttackAnimation: string = '/assets/animations/slash.gif';

  public turnRotation: { character: Character, speedValue: number }[] = [];
  isEnemyTurn: boolean = true;
  currentCharacter: Character = new Character();
  nextTurnBuffer: Character[] = []; // if more chars clock at the same time, gets stored in buffer

  action: FightAction = {
    actionType: ''
  }

  constructor(fightManager: FightManagerService, private eRef: ElementRef, private dataService: DataService, private uiService: UiService, private musicService: MusicService) {
    this.fightManager = fightManager;
  }

  ngOnInit(): void {
    console.log(this.partyData);
    console.log(this.fightData);
    this.fightData = this.fightManager.enemies;
  }

  ngAfterViewInit() {
    this.battlefieldWidth = this.battlefield.nativeElement.offsetWidth;
    console.log('battlefield width: ' + this.battlefieldWidth);
    this.battlefieldHeight = this.battlefield.nativeElement.offsetHeight;
    console.log('battlefield heigth: ' + this.battlefieldHeight);
    this.battleFieldClicked = fromEvent(this.battlefield.nativeElement, 'click').subscribe(() => {
      // undo action selection
      if (this.action.actionType != '') {
        this.action.actionType = '';
        //this.musicService.playSound('range-close');
      }
    });
    this.calculateActorsStartingPositions();
    // Map enemies and party into turnRotation
    this.turnRotation = this.generateTurnRotation();
  }

  skipIntro() {
    if(this.fightStartAnimation) {
      this.fightStartAnimation = false;
      this.resumeFightLoop();
    }
  }


  ngOnDestroy() {
    // add this for performance reason
    this.battleFieldClicked.unsubscribe();
  }

  resumeFightLoop() {
    this.currentCharacter.active = false;
    while (this.isEnemyTurn && this.fightManager.fighting) {
      while (this.nextTurnBuffer.length == 0) {
        this.nextTurnBuffer = this.getNextTurnCharacter();
      }
      this.currentCharacter = this.nextTurnBuffer.pop()!;
      this.isEnemyTurn = this.nextTurn();
    }
    this.uiService.pushText("It's " + this.currentCharacter.name + "'s turn. What's his next move?");
    this.currentCharacter.active = true;
  }

  getNextTurnCharacter() {
    var newBuffer: Character[] = [];
    // updates the speedValue of a character by adding its speed value until someones value is 100
    for (let i = 0; i < this.turnRotation.length; i++) {
      this.turnRotation[i].speedValue = this.turnRotation[i].speedValue + this.turnRotation[i].character.stats.dexterity;
      if (this.turnRotation[i].speedValue >= 100 && (this.fightData!.includes(this.turnRotation[i].character) || this.partyData.includes(this.turnRotation[i].character as PlayingCharacter))) {
        if (Constants.TURN_LOGGING) {
          console.log("==============================");
          console.log("character found: " + this.turnRotation[i].character.name);
          console.log("==============================");
        }
        this.turnRotation[i].speedValue = this.turnRotation[i].speedValue - 100;
        //nextCharacter = this.turnRotation[i].character;
        newBuffer.push(this.turnRotation[i].character);
      }
      if (Constants.TURN_LOGGING)
        console.log("data after " + i + ": " + JSON.stringify(this.turnRotation.map(el => { return el.character.name + ' - ' + el.speedValue })));
    }
    if (Constants.TURN_LOGGING) {
      console.log("============RESULT============");
      console.log(JSON.stringify(newBuffer.map(el => { return el.name })));
    }
    return newBuffer;
  }

  generateTurnRotation() {
    return [
      ...this.fightData!.map(enemy => ({ character: enemy, speedValue: 0 })),
      ...this.partyData.map(player => ({ character: player, speedValue: 0 }))
    ];
  }

  nextTurn() {
    if (!this.fightData!.includes(this.currentCharacter)) {
      return false;
    }
    else {
      this.generateAiTurn(this.currentCharacter);
      return true;
    }
  }

  generateAiTurn(attackingCharacter: Character) {
    // TODO implement skills on ai turn
    this.aggroAndMove(attackingCharacter, this.fightData!.indexOf(attackingCharacter), false, this.partyData)
  }

  getRandomicity() {
    return Math.floor(Math.random() * (RAND_SEED - (RAND_SEED * -1) + 1)) + (RAND_SEED * -1)
  }

  calculateActorsStartingPositions() {
    let scaleFactor = window.innerWidth < 600 ? 1.5 : 1;
    for (var i = 0; i < this.partyCharacters.length; i++) {
      this.partyData[i].fightPositionX = Math.floor(((this.battlefieldWidth * 0.2) + this.getRandomicity()));
      this.partyData[i].fightPositionY = Math.floor(0 - (this.battlefieldHeight / 6 * scaleFactor) + (50 * i) + this.getRandomicity());
      console.log('name : ' + this.partyData[i].name + ' fightPositionX : ' + this.partyData[i].fightPositionX + ' fightPositionY : ' + this.partyData[i].fightPositionY + ' bottom: ' + this.partyCharacters.get(i)!.nativeElement.getBoundingClientRect().bottom + ' right: ' + this.partyCharacters.get(i)!.nativeElement.getBoundingClientRect().right);
      this.partyCharacters.get(i)!.nativeElement.style.transform = `translate(${this.partyData[i].fightPositionX}px, ${this.partyData[i].fightPositionY}px)`;
    }
    for (var j = 0; j < this.enemyCharacters.length; j++) {
      this.fightData![j].fightPositionX = Math.floor((this.battlefieldWidth * 0.8) + this.getRandomicity());
      this.fightData![j].fightPositionY = Math.floor(0 - (this.battlefieldHeight / 3 * scaleFactor) + (50 * j) + this.getRandomicity());
      console.log('name : ' + this.fightData![j].name + ' fightPositionX : ' + this.fightData![j].fightPositionX + ' fightPositionY : ' + this.fightData![j].fightPositionY + ' bottom: ' + this.enemyCharacters.get(j)!.nativeElement.getBoundingClientRect().bottom + ' right: ' + this.enemyCharacters.get(j)!.nativeElement.getBoundingClientRect().right);
      this.enemyCharacters!.get(j)!.nativeElement.style.transform = `translate(${this.fightData![j].fightPositionX}px, ${this.fightData![j].fightPositionY}px)`;
    }
  }

  fightSpeedCurve(x: number): number {
    const m = -0.941;
    const b = 95.1;
    return m * x + b;
  }

  startFightScene() {
    if (window.innerWidth < 600) {
      this.uiService.closeShop(false);
      this.uiService.closeInventory();
    }
    const intervalId = setInterval(() => {

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

    if (Math.abs(dx) < this.currentCharacter.stats.dexterity * this.distanceMultiplier && Math.abs(dy) < this.currentCharacter.stats.dexterity * this.distanceMultiplier) {
      console.log('actor decided to attack');
      /*if (actor.actualAttackCooldown >= 0) {
        console.log('...but his cooldown is yet to be resolved');
        actor.actualAttackCooldown -= this.fightSpeed;
        console.log('cooldown left: ' + actor.actualAttackCooldown);
      } else {*/
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
      //actor.actualAttackCooldown = actor.attackCooldown;
      console.log('damage dealt: ' + attackData.damage);
      this.uiService.pushText(`${actor.name} attacked ${target.name}, making him lose ${attackData.damage} points!`);
      this.uiService.shake(100 * attackData.damage);
      if (attackData.killed) {
        this.musicService.playSound('killed');
        if (!friendly) {
          this.partyData[actorIndex].dead = true;
        } else {
          this.fightData![actorIndex].dead = true;
        }
      }
    } else {
      console.log('actor decided to move');
      this.uiService.pushText(`${actor.name} moved closer to ${target.name}.`);
      // Calculate the new position of the actor
      const speed = actor.stats.dexterity * 8;
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

  moveAttackButtonClicked() {
    this.action.actionType = 'attack';
    this.musicService.playSound('range-open');
  }

  getActionRangeDiameter(actor: Character) {
    if (!this.action.actionType)
      return { diameter: '200px', top: '-150px', left: '-50px' }
    else
      /* 
        top: - ((diameter/2) + (h pawn/2))
        left: - ((diameter/2) + (w pawn/2)

        h pawn / 4 = 31
        w pawn / 2= 50
      */
      return { diameter: (actor.stats.dexterity * this.distanceMultiplier + 'px'), top: (((actor.stats.dexterity * this.distanceMultiplier) * (-1/2)) - 31)  + 'px', left: (((actor.stats.dexterity * this.distanceMultiplier) * (-1/2) + 50) + 'px') }
  }

  enemyClicked(clickedActor: Character) {
    if (this.action.actionType == 'attack') {
      this.moveTowardsOrAttack(this.currentCharacter, this.partyData.indexOf(this.currentCharacter), true, clickedActor);
      this.isEnemyTurn = true;
      this.resumeFightLoop();
    }
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