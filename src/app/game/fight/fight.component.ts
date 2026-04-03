import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { fromEvent, Subscription, take } from 'rxjs';
import { FightManagerService } from '../../services/fight-manager.service';
import { Actor } from '../../model/Actors/Actor';
import { Character } from '../../model/Actors/Character';
import { PlayingCharacter } from '../../model/Actors/PlayingCharacter';
import { MatMenuTrigger } from '@angular/material/menu';
import { Skill } from '../../model/Skill';
import { EffectType } from '../../model/Interaction';
import { Constants } from 'src/assets/constants';
import { DataService } from 'src/app/data.service';
import { UiService } from '../ui-layer/ui.service';
import { MusicService } from 'src/app/services/music.service';
import { RunService } from 'src/app/services/run.service';

export type FightAction = {
  actionType: '' | 'attack' | 'skill'
}

class FightAnimation {
  id: number = 0;
  missileImageSource: string = '';
  x: number = 0; // Pixel x of missile center
  y: number = 0; // Pixel y of missile center
  target: Actor = new Actor();
  rotationAngle: number = 0;
  explodeFn: () => void = () => { };
  nativeElement!: HTMLElement;
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

  // Pawn size in pixels — must match .pawn CSS (100×125px)
  readonly pawnHalfW = 50;
  readonly pawnHalfH = 62;
  // Missile image size in pixels (75×75px)
  readonly missileHalf = 37;



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

  animationPolling: number = 0;
  animations: FightAnimation[] = [];

  @ViewChild('battlefield') battlefield!: ElementRef;
  battlefieldWidth = 0;
  battlefieldHeight = 0;
  battleFieldClicked: Subscription = new Subscription();

  @Output() useSkillSignal = new EventEmitter<{ skill: Skill, target: Actor }>();
  @Output() fleeSignal = new EventEmitter<void>();

  selectedEnemyIndex?: number;
  selectedEnemy?: Actor;
  /** Skill chosen by the player in the skill selection phase. */
  selectedSkill?: Skill;
  /** ID of the slice currently hovered in the skill wheel. */
  hoveredSkillId?: number;
  public currentAttackAnimation: string = '/assets/animations/slash.gif';

  public turnRotation: { character: Character, speedValue: number }[] = [];
  isEnemyTurn: boolean = true;
  currentCharacter: Character = new Character();
  nextTurnBuffer: Character[] = []; // if more chars clock at the same time, gets stored in buffer

  action: FightAction = {
    actionType: ''
  }

  constructor(fightManager: FightManagerService, private eRef: ElementRef, private dataService: DataService, private uiService: UiService, private musicService: MusicService, private runService: RunService) {
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
    cancelAnimationFrame(this.animationPolling);
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

  }

  skipIntro() {
    if (this.fightStartAnimation) {
      this.fightStartAnimation = false;
      this.resumeFightLoop();
    }
  }

  startAnimationPolling() {
    const loop = () => {
      this.animationPolling = requestAnimationFrame(loop);
      this.animations.forEach((animation: FightAnimation) => {
        const speedPx = 8;

        // Target is the pawn center in pixels — read live from DOM
        const targetCenter = this.getPawnCenterPx(animation.target as Character);
        const dx = targetCenter.x - animation.x;
        const dy = targetCenter.y - animation.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < speedPx) {
          animation.explodeFn();
          animation.nativeElement.remove();
          this.animations = this.animations.filter(a => a.id !== animation.id);
          return;
        }

        const angle = Math.atan2(dy, dx);
        animation.x += Math.cos(angle) * speedPx;
        animation.y += Math.sin(angle) * speedPx;
        animation.rotationAngle = angle;

        animation.nativeElement.style.transform =
          `translate(${animation.x - this.missileHalf}px, ${animation.y - this.missileHalf}px) rotate(${angle}rad)`;
      });
    };
    this.animationPolling = requestAnimationFrame(loop);
  }

  async resumeFightLoop() {
    this.currentCharacter.active = false;
    while (this.isEnemyTurn && this.fightManager.fighting) {
      while (this.nextTurnBuffer.length == 0) {
        this.nextTurnBuffer = this.getNextTurnCharacter();
      }
      this.currentCharacter = this.nextTurnBuffer.pop()!;
      this.isEnemyTurn = this.nextTurn();
      if (this.isEnemyTurn && this.fightManager.fighting) {
        await this.turnDelay();
      }
    }
    this.uiService.pushText("It's " + this.currentCharacter.name + "'s turn. What's his next move?");
    this.currentCharacter.active = true;
  }

  private turnDelay(): Promise<void> {
    const speed = this.dataService.getSettings().fightSpeed;
    const ms = (101 - speed) * 25; // speed 1 → 2500ms, speed 100 → 25ms
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getNextTurnCharacter() {
    var newBuffer: Character[] = [];
    // updates the speedValue of a character by adding its speed value until someones value is 100
    for (let i = 0; i < this.turnRotation.length; i++) {
      // skip dead characters — they don't act
      if (this.turnRotation[i].character.dead) continue;
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
      // Player's turn — run AI if auto battle is enabled
      if (this.dataService.getSettings().autoBattle) {
        this.generateAiTurn(this.currentCharacter);
        return true;
      }
      return false;
    }
    else {
      this.generateAiTurn(this.currentCharacter);
      return true;
    }
  }

  generateAiTurn(attackingCharacter: Character) {
    const isPartyMember = this.partyData.includes(attackingCharacter as PlayingCharacter);
    const aliveTargets: Character[] = isPartyMember
      ? (this.fightData?.filter(e => !e.dead) ?? [])
      : this.partyData.filter(p => !p.dead);

    if (aliveTargets.length === 0) return;

    const actorIndex = isPartyMember
      ? this.partyData.indexOf(attackingCharacter as PlayingCharacter)
      : this.fightData!.indexOf(attackingCharacter);
    const friendly = isPartyMember;

    // Check taunt: only applies to enemy characters being taunted by a party member
    if (!isPartyMember) {
      const tauntSourceId = this.fightManager.getTauntSourceId(attackingCharacter);
      if (tauntSourceId !== undefined) {
        const tauntTarget = (aliveTargets as PlayingCharacter[]).find(p => p.id === tauntSourceId) ?? aliveTargets[0];
        this.aggroAndMove(attackingCharacter, actorIndex, friendly, [tauntTarget]);
        return;
      }
    }

    // Probability-based skill casting: 40% chance to use a skill if any are affordable
    const usableSkills = attackingCharacter.skills.filter(
      s => attackingCharacter.stats.skillPoints >= s.cost
    );
    if (usableSkills.length > 0 && Math.random() < 0.4) {
      const skill = usableSkills[Math.floor(Math.random() * usableSkills.length)];
      const isSelfTargeting = skill.effect === EffectType.heal || skill.effect === EffectType.buffStat;
      const target: Character = isSelfTargeting ? attackingCharacter : aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
      this.castSelectedSkill(attackingCharacter, skill, target);
      return;
    }
    this.aggroAndMove(attackingCharacter, actorIndex, friendly, aliveTargets);
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

  /** Returns the pixel coordinates of a pawn's visual center, relative to the battlefield top-left. */
  getPawnCenterPx(actor: Character): { x: number; y: number } {
    const partyIdx = this.partyData.indexOf(actor as PlayingCharacter);
    const element = partyIdx >= 0
      ? this.partyCharacters.get(partyIdx)?.nativeElement
      : this.enemyCharacters.get(this.fightData!.indexOf(actor))?.nativeElement;

    if (!element) return { x: 0, y: 0 };

    const pawnRect: DOMRect = element.getBoundingClientRect();
    const bfRect: DOMRect = this.battlefield.nativeElement.getBoundingClientRect();
    return {
      x: pawnRect.left - bfRect.left + pawnRect.width / 2,
      y: pawnRect.top - bfRect.top + pawnRect.height / 2
    };
  }

  /** Returns the attack range for an actor in pixels (matches the visual range circle). */
  getAttackRangePixels(actor: Character): number {
    const rangePercent = this.baseAttackRange + (actor.stats.dexterity * 0.5) + (actor.class?.attackRange || 0);
    return this.percentageToPixels(rangePercent, true);
  }

  calculateDistance(actor: Character, enemy: Character): number {
    // Calculate pixel distance so it matches the visual range circle
    const dxPx = (actor.fightPositionX - enemy.fightPositionX) * this.battlefieldWidth / 100;
    const dyPx = (actor.fightPositionY - enemy.fightPositionY) * this.battlefieldHeight / 100;
    return Math.sqrt(dxPx * dxPx + dyPx * dyPx);
  }

  moveTowardsOrAttack(actor: Character, actorIndex: number = 0, friendly: boolean, target: Character) {
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log('actor: ' + actor.name + ' - target ' + target.name);

    // Compute angle and distance in pixel space so they match the visual range circle
    const dxPx = (target.fightPositionX - actor.fightPositionX) * this.battlefieldWidth / 100;
    const dyPx = (target.fightPositionY - actor.fightPositionY) * this.battlefieldHeight / 100;
    const distance = Math.sqrt(dxPx * dxPx + dyPx * dyPx);
    const angle = Math.atan2(dyPx, dxPx);

    // Attack range in pixels — same value used by the visual range circle
    const attackRange = this.getAttackRangePixels(actor);

    console.log(`${actor.name} - distance: ${distance.toFixed(0)}px, attack range: ${attackRange.toFixed(0)}px`);

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
        const senderCenter = this.getPawnCenterPx(actor);
        const missileAnimation: FightAnimation = {
          missileImageSource: '/assets/animations/slash.gif',
          id: this.animations.length + 1,
          x: senderCenter.x,
          y: senderCenter.y,
          target: target,
          rotationAngle: angle,
          explodeFn: this.processDamage.bind(this, actor, actorIndex, friendly, target),
          nativeElement: this.createMissileElement('/assets/animations/slash.gif', senderCenter.x, senderCenter.y)
        };
        this.animations.push(missileAnimation);
      } else {
        console.log(`${actor.name} is performing a melee attack (class: ${actor.class?.name}, range: ${actor.class?.attackRange})`);
        this.processDamage(actor, actorIndex, friendly, target);
      }
    } else {
      console.log('actor decided to move');
      this.uiService.pushText(`${actor.name} moved closer to ${target.name}.`);

      // Move in pixel space, then convert back to percentages for position storage
      const moveSpeedPx = (this.baseMoveSpeed + (actor.stats.dexterity * 0.3)) / 100 * this.battlefieldWidth;
      const moveDistancePx = Math.min(moveSpeedPx, distance); // Don't overshoot

      const moveXPx = Math.cos(angle) * moveDistancePx;
      const moveYPx = Math.sin(angle) * moveDistancePx;

      // Update actor position (keeping within battlefield bounds)
      actor.fightPositionX = Math.max(5, Math.min(95, actor.fightPositionX + moveXPx / this.battlefieldWidth * 100));
      actor.fightPositionY = Math.max(10, Math.min(90, actor.fightPositionY + moveYPx / this.battlefieldHeight * 100));

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

  createMissileElement(imageSource: string, centerXPx: number, centerYPx: number): HTMLElement {
    const missile = document.createElement('img');
    missile.src = imageSource;
    missile.style.cssText = `position:absolute; left:0; top:0; width:75px; height:75px; pointer-events:none; z-index:10;`;
    missile.style.transform = `translate(${centerXPx - this.missileHalf}px, ${centerYPx - this.missileHalf}px)`;
    this.battlefield.nativeElement.appendChild(missile);
    return missile;
  }

  processDamage(actor: Character, actorIndex: number, friendly: boolean, target: Character) {
    let attackData = this.fightManager.processAttack(actor, target, false);
    console.log('damage dealt: ' + attackData.damage);
    this.uiService.pushText(`${actor.name} attacked ${target.name}, making him lose ${attackData.damage} points!`);
    this.uiService.shake(100 * attackData.damage);
    if (attackData.killed) {
      this.musicService.playSound('killed');
      if (friendly) {
        // party member killed an enemy — find the correct enemy by id
        const deadEnemy = this.fightData?.find(e => e.id === target.id);
        if (deadEnemy) deadEnemy.dead = true;
      } else {
        // enemy killed a party member — find the correct party member by id
        const deadMember = this.partyData.find(p => p.id === target.id);
        if (deadMember) deadMember.dead = true;
      }
    }
  }

  getAnimationTransform(animation: FightAnimation) {
    return `translate(${animation.x - this.missileHalf}px, ${animation.y - this.missileHalf}px) rotate(${animation.rotationAngle}rad)`;
  }

  moveAttackButtonClicked() {
    this.action.actionType = 'attack';
    this.selectedSkill = undefined;
    this.musicService.playSound('range-open');
  }

  getActionRangeDiameter(actor: Character) {
    if (!this.action.actionType) {
      return { diameter: '200px', top: '-150px', left: '-50px' };
    } else {
      // Use getAttackRangePixels so the visual circle exactly matches the logical attack range
      const rangePixels = this.getAttackRangePixels(actor);
      const diameter = rangePixels * 2;
      const top = -diameter / 2 - 31;
      const left = -diameter / 2 + 50;
      return {
        diameter: `${diameter}px`,
        top: `${top}px`,
        left: `${left}px`
      };
    }
  }

  /**
   * Computes SVG path data for each skill slice in the skill wheel.
   * Returns one entry per skill with the pie-slice path and label position.
   */
  trackBySkillSlice(_index: number, slice: { skill: Skill }): number {
    return slice.skill.id;
  }

  getSkillWheelSlices(skills: Skill[]): { path: string; textX: number; textY: number; skill: Skill }[] {
    const n = skills.length;
    if (n === 0) return [];
    const cx = 100, cy = 100, r = 100;
    const sliceAngle = (2 * Math.PI) / n;
    return skills.map((skill, i) => {
      const midAngle = i * sliceAngle + sliceAngle / 2 - Math.PI / 2;
      const textR = r * 0.6;
      const textX = parseFloat((cx + textR * Math.cos(midAngle)).toFixed(2));
      const textY = parseFloat((cy + textR * Math.sin(midAngle)).toFixed(2));
      let path: string;
      if (n === 1) {
        // Full circle drawn as two half-arcs
        path = `M 100 0 A 100 100 0 1 1 100 200 A 100 100 0 1 1 100 0 Z`;
      } else {
        const startAngle = i * sliceAngle - Math.PI / 2;
        const endAngle = (i + 1) * sliceAngle - Math.PI / 2;
        const x1 = parseFloat((cx + r * Math.cos(startAngle)).toFixed(2));
        const y1 = parseFloat((cy + r * Math.sin(startAngle)).toFixed(2));
        const x2 = parseFloat((cx + r * Math.cos(endAngle)).toFixed(2));
        const y2 = parseFloat((cy + r * Math.sin(endAngle)).toFixed(2));
        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      }
      return { path, textX, textY, skill };
    });
  }

  enemyClicked(clickedActor: Character) {
    if (clickedActor.dead) return;
    if (this.action.actionType == 'attack') {
      this.moveTowardsOrAttack(this.currentCharacter, this.partyData.indexOf(this.currentCharacter), true, clickedActor);
      this.resetAction();
      this.isEnemyTurn = true;
      this.resumeFightLoop();
    } else if (this.action.actionType == 'skill' && this.selectedSkill) {
      this.castSelectedSkill(this.currentCharacter, this.selectedSkill, clickedActor);
    }
  }

  partyMemberClicked(actor: PlayingCharacter) {
    if (this.action.actionType == 'skill' && this.selectedSkill) {
      this.castSelectedSkill(this.currentCharacter, this.selectedSkill, actor);
    }
  }

  skillButtonClicked() {
    this.action.actionType = 'skill';
    this.selectedSkill = undefined;
    this.musicService.playSound('range-open');
  }

  selectSkillFromMenu(skill: Skill) {
    console.log('[SkillWheel] Skill clicked:', skill);
    this.selectedSkill = skill;
  }

  castSelectedSkill(caster: Character, skill: Skill, target: Character) {
    const result = this.fightManager.castSkill(caster, skill, target);
    this.uiService.pushText(result.message);
    if (result.stolenEquip) {
      this.runService.addItemToInventory(result.stolenEquip);
    }
    this.resetAction();
    this.isEnemyTurn = true;
    this.resumeFightLoop();
  }

  resetAction() {
    this.action.actionType = '';
    this.selectedSkill = undefined;
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