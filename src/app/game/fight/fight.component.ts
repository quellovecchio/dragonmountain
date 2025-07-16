import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { fromEvent, Subscription, take } from 'rxjs';
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
  id: number = 0;
  missileImageSource: string = '';
  x: number = 0; // Percentage of battlefield width (0-100)
  y: number = 0; // Percentage of battlefield height (0-100)
  target: Actor = new Actor();
  rotationAngle: number = 0;
  explodeFn: () => void = () => { };
  nativeElement: HTMLElement = new HTMLElement();
}



const RAND_SEED = 50;

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.scss']
})
export class FightComponent implements OnInit {

  // fight constants - now using percentage-based system
  baseAttackRange = 15; // Base attack range as percentage of battlefield
  baseMoveSpeed = 8; // Base movement speed as percentage per turn



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

  animationPolling: any;
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
    this.updateBattlefieldDimensions();
    this.battleFieldClicked = fromEvent(this.battlefield.nativeElement, 'click').subscribe(() => {
      // undo action selection
      if (this.action.actionType != '') {
        this.action.actionType = '';
        //this.musicService.playSound('range-close');
      }
    });

    // Add window resize listener for responsive behavior
    window.addEventListener('resize', this.onWindowResize.bind(this));

    this.calculateActorsStartingPositions();
    this.startAnimationPolling();
    // Map enemies and party into turnRotation
    this.turnRotation = this.generateTurnRotation();

    // Auto-start battle after 2 seconds
    setTimeout(() => {
      this.skipIntro();
    }, 2000);
  }

  ngOnDestroy() {
    if (this.animationPolling) {
      clearInterval(this.animationPolling);
      this.animationPolling = undefined;
    }
    this.battleFieldClicked.unsubscribe();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  updateBattlefieldDimensions() {
    this.battlefieldWidth = this.battlefield.nativeElement.offsetWidth;
    this.battlefieldHeight = this.battlefield.nativeElement.offsetHeight;
    console.log(`Battlefield dimensions: ${this.battlefieldWidth}x${this.battlefieldHeight}`);
  }

  onWindowResize() {
    // Update battlefield dimensions
    this.updateBattlefieldDimensions();

    // Reposition all actors to maintain their percentage-based positions
    this.partyData.forEach((actor, index) => {
      if (this.partyCharacters.get(index)) {
        this.updateActorPosition(
          this.partyCharacters.get(index)!.nativeElement,
          actor.fightPositionX,
          actor.fightPositionY
        );
      }
    });

    this.fightData?.forEach((actor, index) => {
      if (this.enemyCharacters.get(index)) {
        this.updateActorPosition(
          this.enemyCharacters.get(index)!.nativeElement,
          actor.fightPositionX,
          actor.fightPositionY
        );
      }
    });

    // Update any active missiles
    this.animations.forEach(animation => {
      const xPixels = this.percentageToPixels(animation.x, true);
      const yPixels = this.percentageToPixels(animation.y, false);
      animation.nativeElement.style.transform = `translate(${xPixels}px, ${yPixels}px) rotate(${animation.rotationAngle}rad)`;
    });
  }

  skipIntro() {
    if (this.fightStartAnimation) {
      this.fightStartAnimation = false;
      this.resumeFightLoop();
    }
  }

  startAnimationPolling() {
    this.animationPolling = setInterval(() => {
      this.animations.forEach((animation: FightAnimation) => {
        // Calculate the distance to target (in percentage)
        const speed = 1.5; // Percentage per frame
        const dx = (animation.target as Character).fightPositionX - animation.x;
        const dy = (animation.target as Character).fightPositionY - animation.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if missile has reached target
        if (distance < speed) {
          animation.explodeFn();
          animation.nativeElement.remove();
          this.animations = this.animations.filter(a => a.id !== animation.id);
          return;
        }

        // Calculate movement direction
        const angle = Math.atan2(dy, dx);
        const distanceX = Math.cos(angle) * speed;
        const distanceY = Math.sin(angle) * speed;

        // Update missile position (in percentage)
        animation.x += distanceX;
        animation.y += distanceY;
        animation.rotationAngle = angle;

        // Convert percentage to pixels for DOM positioning
        const xPixels = this.percentageToPixels(animation.x, true);
        const yPixels = this.percentageToPixels(animation.y, false);
        animation.nativeElement.style.transform = `translate(${xPixels}px, ${yPixels}px) rotate(${angle}rad)`;
      });
    }, 1000 / 60); // 60 FPS
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

  getRandomPercentage(range: number): number {
    return (Math.random() - 0.5) * range;
  }

  updateActorPosition(element: HTMLElement, xPercent: number, yPercent: number) {
    // Convert percentage to actual pixels based on battlefield size
    const xPixels = (xPercent / 100) * this.battlefieldWidth;
    const yPixels = (yPercent / 100) * this.battlefieldHeight;
    element.style.transform = `translate(${xPixels}px, ${yPixels}px)`;
  }

  percentageToPixels(percent: number, isWidth: boolean): number {
    return (percent / 100) * (isWidth ? this.battlefieldWidth : this.battlefieldHeight);
  }

  pixelsToPercentage(pixels: number, isWidth: boolean): number {
    return (pixels / (isWidth ? this.battlefieldWidth : this.battlefieldHeight)) * 100;
  }

  calculateActorsStartingPositions() {
    // Position party members more to the left and higher up, with better spacing
    for (var i = 0; i < this.partyCharacters.length; i++) {
      const baseX = 15; // % from left
      const baseY = 5; // % from top
      const spacing = this.partyData.length > 1 ? 15 / (this.partyData.length - 1) : 0;

      this.partyData[i].fightPositionX = baseX + this.getRandomPercentage(5);
      this.partyData[i].fightPositionY = baseY - (spacing * (this.partyData.length - 1) / 2) + (spacing * i) + this.getRandomPercentage(5);

      this.updateActorPosition(this.partyCharacters.get(i)!.nativeElement, this.partyData[i].fightPositionX, this.partyData[i].fightPositionY);
      console.log(`${this.partyData[i].name} positioned at ${this.partyData[i].fightPositionX.toFixed(1)}%, ${this.partyData[i].fightPositionY.toFixed(1)}%`);
    }

    // Position enemies more to the right and higher up, with better spacing
    for (var j = 0; j < this.enemyCharacters.length; j++) {
      const baseX = 85; // % from left
      const baseY = 5; // % from top
      const spacing = this.fightData!.length > 1 ? 15 / (this.fightData!.length - 1) : 0;

      this.fightData![j].fightPositionX = baseX + this.getRandomPercentage(5);
      this.fightData![j].fightPositionY = baseY - (spacing * (this.fightData!.length - 1) / 2) + (spacing * j) + this.getRandomPercentage(5);

      this.updateActorPosition(this.enemyCharacters.get(j)!.nativeElement, this.fightData![j].fightPositionX, this.fightData![j].fightPositionY);
      console.log(`${this.fightData![j].name} positioned at ${this.fightData![j].fightPositionX.toFixed(1)}%, ${this.fightData![j].fightPositionY.toFixed(1)}%`);
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

    // Calculate the distance between the actor and the target (in percentage)
    const dx = target.fightPositionX - actor.fightPositionX;
    const dy = target.fightPositionY - actor.fightPositionY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Calculate attack range based on character stats and class
    const attackRange = this.baseAttackRange + (actor.stats.dexterity * 0.5) + (actor.class?.attackRange || 0);

    console.log(`${actor.name} - distance: ${distance.toFixed(2)}%, attack range: ${attackRange}%`);

    if (distance <= attackRange) {
      console.log('actor decided to attack');

      // Attack animations
      this.musicService.playSound('attack');
      target.damaged = true;
      setTimeout(() => {
        target.damaged = false;
      }, 500);

      // Launch missile for ranged attacks, direct damage for melee
      if (actor.class && actor.class.attackRange > 0) {
        console.log(`${actor.name} is launching a ranged attack with range ${actor.class.attackRange}`);
        const missileAnimation: FightAnimation = {
          missileImageSource: '/assets/animations/slash.gif',
          id: this.animations.length + 1,
          x: actor.fightPositionX,
          y: actor.fightPositionY,
          target: target,
          rotationAngle: angle,
          explodeFn: this.processDamage.bind(this, actor, actorIndex, friendly, target),
          nativeElement: this.createMissileElement('/assets/animations/slash.gif', actor.fightPositionX, actor.fightPositionY)
        };
        this.animations.push(missileAnimation);
      } else {
        console.log(`${actor.name} is performing a melee attack (class: ${actor.class?.name}, range: ${actor.class?.attackRange})`);
        this.processDamage(actor, actorIndex, friendly, target);
      }
    } else {
      console.log('actor decided to move');
      this.uiService.pushText(`${actor.name} moved closer to ${target.name}.`);

      // Calculate movement (percentage-based)
      const moveSpeed = this.baseMoveSpeed + (actor.stats.dexterity * 0.3);
      const moveDistance = Math.min(moveSpeed, distance); // Don't overshoot

      const moveX = Math.cos(angle) * moveDistance;
      const moveY = Math.sin(angle) * moveDistance;

      // Update actor position (keeping within battlefield bounds)
      actor.fightPositionX = Math.max(5, Math.min(95, actor.fightPositionX + moveX));
      actor.fightPositionY = Math.max(10, Math.min(90, actor.fightPositionY + moveY));

      // Update DOM position
      if (friendly) {
        this.updateActorPosition(this.partyCharacters.get(actorIndex)!.nativeElement, actor.fightPositionX, actor.fightPositionY);
      } else {
        this.updateActorPosition(this.enemyCharacters.get(actorIndex)!.nativeElement, actor.fightPositionX, actor.fightPositionY);
      }

      console.log(`${actor.name} moved to ${actor.fightPositionX.toFixed(1)}%, ${actor.fightPositionY.toFixed(1)}%`);
    }
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
  }

  createMissileElement(imageSource: string, xPercent: number, yPercent: number): HTMLElement {
    const missile = document.createElement('img');
    missile.src = imageSource;
    missile.style.position = 'absolute';
    missile.style.width = '75px';
    missile.style.height = '75px';

    // Convert percentage to pixels for initial positioning
    const xPixels = this.percentageToPixels(xPercent, true);
    const yPixels = this.percentageToPixels(yPercent, false);

    missile.style.left = `${xPixels}px`;
    missile.style.top = `${yPixels}px`;
    missile.style.transform = 'translate(-50%, -50%)'; // Center the missile
    missile.style.pointerEvents = 'none'; // Prevent interaction
    missile.style.zIndex = '10'; // Ensure it appears above other elements

    // Append to battlefield instead of body for proper positioning context
    this.battlefield.nativeElement.appendChild(missile);
    return missile;
  }

  processDamage(actor: Character, actorIndex: number, friendly: boolean, target: Character) {
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
  }

  getAnimationTransform(animation: FightAnimation) {
    // Convert percentage coordinates to pixels for CSS transform
    const xPixels = this.percentageToPixels(animation.x, true);
    const yPixels = this.percentageToPixels(animation.y, false);
    return `translate(${xPixels}px, ${yPixels}px) rotate(${animation.rotationAngle}rad)`;
  }

  moveAttackButtonClicked() {
    this.action.actionType = 'attack';
    this.musicService.playSound('range-open');
  }

  getActionRangeDiameter(actor: Character) {
    if (!this.action.actionType) {
      return { diameter: '200px', top: '-150px', left: '-50px' };
    } else {
      // Calculate range in percentage, then convert to pixels for display
      const rangePercent = this.baseAttackRange + (actor.stats.dexterity * 0.5) + (actor.class?.attackRange || 0);
      const rangePixels = this.percentageToPixels(rangePercent, true); // Use width as reference

      // Calculate positioning to center the range circle
      const diameter = rangePixels * 2; // Full diameter
      const top = -diameter / 2 - 31; // Center vertically, offset by pawn height
      const left = -diameter / 2 + 50; // Center horizontally, offset by pawn width

      return {
        diameter: `${diameter}px`,
        top: `${top}px`,
        left: `${left}px`
      };
    }
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