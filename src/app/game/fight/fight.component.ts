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
import { BuffType } from '../../model/Buff';

export type FightAction = {
  actionType: '' | 'attack' | 'skill'
}

class FightAnimation {
  id: number = 0;
  missileImageSource: string = '';
  x: number = 0;
  y: number = 0;
  target: Actor = new Actor();
  rotationAngle: number = 0;
  explodeFn: () => void = () => { };
  nativeElement!: HTMLElement;
}

interface DamageNumber {
  id: number;
  amount: number;
  kind: 'damage' | 'heal' | 'crit';
  x: number;
  y: number;
}

interface ClashBurst {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface ShatterParticle {
  dx: number;
  dy: number;
  dr: number;
  size: number;
  color: string;
  delay: number;
}

interface ShatterSet {
  id: number;
  x: number;
  y: number;
  particles: ShatterParticle[];
}

export interface LootItem {
  name: string;
  thumbnailPath: string;
  rarity?: string;
}

const RAND_SEED = 50;

@Component({
  selector: 'app-fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.scss']
})
export class FightComponent implements OnInit {

  // fight constants
  baseAttackRange = 15;
  baseMoveSpeed = 8;

  readonly pawnHalfW = 49;
  readonly pawnHalfH = 74;
  readonly missileHalf = 36; // 72px / 2

  // ── Intro state ────────────────────────────────────────────────────────
  fightStartAnimation: boolean = true;
  introPhase: number = 0; // 0=mist, 1=portraits in, 2=title, 3=fading
  @Input() locationName: string = 'Battle';

  // ── Victory state ──────────────────────────────────────────────────────
  showVictory: boolean = false;
  victoryPhase: number = 0; // 0→4 driven by timeouts
  lootItems: LootItem[] = [];

  // ── FX state ───────────────────────────────────────────────────────────
  damageNumbers: DamageNumber[] = [];
  clashBursts: ClashBurst[] = [];
  shatterSets: ShatterSet[] = [];
  commentary: { text: string; kind: string } | null = null;
  blackFlashKey: number | null = null;
  private fxId = 0;

  // ── Existing state ─────────────────────────────────────────────────────
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
  selectedSkill?: Skill;
  hoveredSkillId?: number;
  public currentAttackAnimation: string = '/assets/animations/slash.gif';

  public turnRotation: { character: Character, speedValue: number }[] = [];
  isEnemyTurn: boolean = true;
  currentCharacter: Character = new Character();
  nextTurnBuffer: Character[] = [];

  action: FightAction = { actionType: '' };

  constructor(
    fightManager: FightManagerService,
    private eRef: ElementRef,
    private dataService: DataService,
    private uiService: UiService,
    private musicService: MusicService,
    private runService: RunService
  ) {
    this.fightManager = fightManager;
  }

  ngOnInit(): void {
    this.fightData = this.fightManager.enemies;
  }

  ngAfterViewInit() {
    this.updateBattlefieldDimensions();
    this.battleFieldClicked = fromEvent(this.battlefield.nativeElement, 'click').subscribe(() => {
      if (this.action.actionType != '') {
        this.action.actionType = '';
      }
    });
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.calculateActorsStartingPositions();
    this.startAnimationPolling();
    this.turnRotation = this.generateTurnRotation();
    this.startIntroSequence();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationPolling);
    this.battleFieldClicked.unsubscribe();
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  // ── Intro sequence ─────────────────────────────────────────────────────

  startIntroSequence() {
    this.introPhase = 0;
    this.fightStartAnimation = true;
    setTimeout(() => { this.introPhase = 1; }, 400);
    setTimeout(() => { this.introPhase = 2; }, 1100);
    setTimeout(() => { this.introPhase = 3; }, 2200);
    setTimeout(() => { this.skipIntro(); }, 2900);
  }

  skipIntro() {
    if (this.fightStartAnimation) {
      this.fightStartAnimation = false;
      this.introPhase = 0;
      this.resumeFightLoop();
    }
  }

  // ── Victory sequence ───────────────────────────────────────────────────

  triggerVictory() {
    this.fightManager.holdFightEnd = true;
    // gather loot from defeated enemies
    this.lootItems = (this.fightData ?? [])
      .flatMap(e => e.loot ?? [])
      .map(item => ({
        name: (item as any).name ?? 'Item',
        thumbnailPath: (item as any).thumbnailPath ?? 'assets/images/items/item2.png',
        // Rarity is a numeric enum — convert to lowercase string name
        rarity: typeof (item as any).rarity === 'number'
          ? ['common','uncommon','rare','epic','legendary'][(item as any).rarity] ?? 'common'
          : ((item as any).rarity ?? 'common'),
      }));

    this.showVictory = true;
    this.victoryPhase = 0;
    setTimeout(() => { this.victoryPhase = 1; }, 400);
    setTimeout(() => { this.victoryPhase = 2; }, 700);
    setTimeout(() => { this.victoryPhase = 3; }, 1500);
    setTimeout(() => { this.victoryPhase = 4; }, 2100);
  }

  onVictoryDone() {
    this.showVictory = false;
    this.fightManager.holdFightEnd = false;
    // RunService interval will now detect isBattleOver() = true and call endFight()
  }

  getLootItemOffset(index: number, total: number): number {
    const angle = (index - (total - 1) / 2) * 0.25;
    return Math.sin(angle) * 120;
  }

  // ── FX helpers ─────────────────────────────────────────────────────────

  pushDamageNumber(amount: number, kind: 'damage' | 'heal' | 'crit', x: number, y: number) {
    const id = ++this.fxId;
    this.damageNumbers = [...this.damageNumbers, { id, amount, kind, x, y }];
    setTimeout(() => {
      this.damageNumbers = this.damageNumbers.filter(d => d.id !== id);
    }, 1150);
  }

  pushClash(x: number, y: number, isCrit: boolean) {
    const id = ++this.fxId;
    const color = isCrit ? '#F1C66A' : '#f16c6a';
    this.clashBursts = [...this.clashBursts, { id, x, y, color }];
    setTimeout(() => {
      this.clashBursts = this.clashBursts.filter(c => c.id !== id);
    }, 600);
  }

  pushShatter(x: number, y: number, side: 'party' | 'enemy') {
    const baseColor = side === 'enemy' ? '#cc5544' : '#4c7b94';
    const particles: ShatterParticle[] = Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 40 + Math.random() * 60;
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 18,
        dr: (Math.random() - 0.5) * 720,
        size: 4 + Math.floor(Math.random() * 5),
        color: i % 3 === 0 ? '#fff' : (i % 3 === 1 ? baseColor : '#000'),
        delay: Math.random() * 0.05,
      };
    });
    const id = ++this.fxId;
    this.shatterSets = [...this.shatterSets, { id, x, y, particles }];
    setTimeout(() => {
      this.shatterSets = this.shatterSets.filter(s => s.id !== id);
    }, 1000);
  }

  speak(text: string, kind: string = 'neutral') {
    this.commentary = { text, kind };
    setTimeout(() => {
      if (this.commentary?.text === text) this.commentary = null;
    }, 3200);
  }

  triggerBlackFlash() {
    this.blackFlashKey = Date.now();
    setTimeout(() => { this.blackFlashKey = null; }, 500);
  }

  // ── Buff display helpers ───────────────────────────────────────────────

  getBuffColor(type: BuffType): string {
    const map: Record<string, string> = {
      [BuffType.statBoost]: '#4c7b94',
      [BuffType.poison]:    '#22c55e',
      [BuffType.stun]:      '#F1C66A',
      [BuffType.taunt]:     '#f16c6a',
    };
    return map[type] ?? '#F4E0B9';
  }

  getBuffIcon(type: BuffType): string {
    const map: Record<string, string> = {
      [BuffType.statBoost]: '▲',
      [BuffType.poison]:    '☠',
      [BuffType.stun]:      '◎',
      [BuffType.taunt]:     '!',
    };
    return map[type] ?? '✦';
  }

  // ── HP/SP bar helpers ──────────────────────────────────────────────────

  getHpPct(actor: Character): number {
    const max = actor.stats.constitution;
    return max > 0 ? Math.max(0, Math.min(100, (actor.stats.healthPoints / max) * 100)) : 0;
  }

  getSpPct(actor: Character): number {
    const max = actor.stats.intelligence;
    return max > 0 ? Math.max(0, Math.min(100, (actor.stats.skillPoints / max) * 100)) : 0;
  }

  isPartyMemberChar(c: Character): boolean {
    return this.partyData.some(p => p.id === c.id);
  }

  // ── Turn queue for timeline ladder ─────────────────────────────────────

  get turnQueue(): { character: Character; isCurrent: boolean; isNext: boolean }[] {
    const alive = this.turnRotation.filter(t => !t.character.dead);
    if (alive.length === 0) return [];
    const curIdx = alive.findIndex(t => t.character.id === this.currentCharacter.id);
    const base = curIdx >= 0
      ? [...alive.slice(curIdx), ...alive.slice(0, curIdx)]
      : alive;
    // Pad to at least 5 entries by repeating
    const padded: typeof alive = [...base];
    while (padded.length < 5) padded.push(...base);
    return padded.slice(0, 5).map((t, i) => ({
      character: t.character,
      isCurrent: i === 0,
      isNext: i === 1,
    }));
  }

  getTimelineThumbSize(index: number): number {
    if (index === 0) return 48;
    return Math.max(28, 36 - Math.min(index - 1, 2) * 2);
  }

  getShatterParticleStyle(p: ShatterParticle): string {
    return `position:absolute;left:0;top:0;` +
      `width:${p.size}px;height:${p.size}px;` +
      `background:${p.color};` +
      `image-rendering:pixelated;` +
      `animation:shatter-fly 0.9s ${p.delay.toFixed(3)}s ease-out forwards;` +
      `--dx:${p.dx.toFixed(1)}px;--dy:${p.dy.toFixed(1)}px;--dr:${p.dr.toFixed(1)}deg`;
  }

  // ── Particle trail missile ─────────────────────────────────────────────

  createParticleTrailMissile(
    from: { x: number; y: number },
    to: { x: number; y: number },
    onArrive: () => void,
    duration = 600
  ) {
    const container = document.createElement('div');
    container.className = 'missile-particle-trail';
    container.style.position = 'absolute';
    container.style.left = '0';
    container.style.top = '0';
    container.style.pointerEvents = 'none';

    const core = document.createElement('div');
    core.className = 'particle-core';
    container.appendChild(core);

    const tailSizes = [13, 8, 4];
    const tails = tailSizes.map(s => {
      const t = document.createElement('div');
      t.className = 'particle-tail';
      t.style.width = s + 'px';
      t.style.height = s + 'px';
      container.appendChild(t);
      return t;
    });

    const animationsDiv = this.battlefield.nativeElement.querySelector('.animations');
    (animationsDiv || this.battlefield.nativeElement).appendChild(container);

    const t0 = performance.now();
    const bkOffsets = [0.18, 0.32, 0.5];

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const e = t * t * (3 - 2 * t);
      const cx = from.x + (to.x - from.x) * e;
      const cy = from.y + (to.y - from.y) * e;

      core.style.left = cx + 'px';
      core.style.top = cy + 'px';

      bkOffsets.forEach((bk, i) => {
        tails[i].style.left = (cx - (to.x - from.x) * bk * 0.3) + 'px';
        tails[i].style.top  = (cy - (to.y - from.y) * bk * 0.3) + 'px';
        tails[i].style.opacity = String(0.7 - i * 0.18);
      });

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        container.remove();
        onArrive();
      }
    };
    requestAnimationFrame(tick);
  }

  // ── Existing methods ───────────────────────────────────────────────────

  updateBattlefieldDimensions() {
    this.battlefieldWidth = this.battlefield.nativeElement.offsetWidth;
    this.battlefieldHeight = this.battlefield.nativeElement.offsetHeight;
  }

  onWindowResize() {
    this.updateBattlefieldDimensions();
    this.partyData.forEach((actor, index) => {
      if (this.partyCharacters.get(index)) {
        this.updateActorPosition(
          this.partyCharacters.get(index)!.nativeElement,
          actor.fightPositionX, actor.fightPositionY
        );
      }
    });
    this.fightData?.forEach((actor, index) => {
      if (this.enemyCharacters.get(index)) {
        this.updateActorPosition(
          this.enemyCharacters.get(index)!.nativeElement,
          actor.fightPositionX, actor.fightPositionY
        );
      }
    });
  }

  startAnimationPolling() {
    const loop = () => {
      this.animationPolling = requestAnimationFrame(loop);
      this.animations.forEach((animation: FightAnimation) => {
        const speedPx = 8;
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
    //this.uiService.pushText("It's " + this.currentCharacter.name + "'s turn. What's his next move?");
    this.currentCharacter.active = true;
  }

  private turnDelay(): Promise<void> {
    const speed = this.dataService.getSettings().fightSpeed;
    const ms = (101 - speed) * 25;
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getNextTurnCharacter() {
    var newBuffer: Character[] = [];
    for (let i = 0; i < this.turnRotation.length; i++) {
      if (this.turnRotation[i].character.dead) continue;
      this.turnRotation[i].speedValue += this.turnRotation[i].character.stats.dexterity;
      if (this.turnRotation[i].speedValue >= 100 &&
        (this.fightData!.includes(this.turnRotation[i].character) ||
          this.partyData.includes(this.turnRotation[i].character as PlayingCharacter))) {
        this.turnRotation[i].speedValue -= 100;
        newBuffer.push(this.turnRotation[i].character);
      }
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
      if (this.dataService.getSettings().autoBattle) {
        this.generateAiTurn(this.currentCharacter);
        return true;
      }
      return false;
    } else {
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

    if (!isPartyMember) {
      const tauntSourceId = this.fightManager.getTauntSourceId(attackingCharacter);
      if (tauntSourceId !== undefined) {
        const tauntTarget = (aliveTargets as PlayingCharacter[]).find(p => p.id === tauntSourceId) ?? aliveTargets[0];
        this.aggroAndMove(attackingCharacter, actorIndex, friendly, [tauntTarget]);
        return;
      }
    }

    const usableSkills = attackingCharacter.skills.filter(
      s => attackingCharacter.stats.skillPoints >= s.cost
    );
    if (usableSkills.length > 0 && Math.random() < 0.4) {
      const skill = usableSkills[Math.floor(Math.random() * usableSkills.length)];
      const isSelfTargeting = skill.effect === EffectType.heal || skill.effect === EffectType.buffStat;
      const target: Character = isSelfTargeting
        ? attackingCharacter
        : aliveTargets[Math.floor(Math.random() * aliveTargets.length)];
      this.castSelectedSkill(attackingCharacter, skill, target);
      return;
    }
    this.aggroAndMove(attackingCharacter, actorIndex, friendly, aliveTargets);
  }

  getRandomPercentage(range: number): number {
    return (Math.random() - 0.5) * range;
  }

  updateActorPosition(element: HTMLElement, xPercent: number, yPercent: number) {
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
    for (var i = 0; i < this.partyCharacters.length; i++) {
      const baseX = 15;
      const baseY = 5;
      const spacing = this.partyData.length > 1 ? 15 / (this.partyData.length - 1) : 0;
      this.partyData[i].fightPositionX = baseX + this.getRandomPercentage(5);
      this.partyData[i].fightPositionY = baseY - (spacing * (this.partyData.length - 1) / 2) + (spacing * i) + this.getRandomPercentage(5);
      this.updateActorPosition(this.partyCharacters.get(i)!.nativeElement, this.partyData[i].fightPositionX, this.partyData[i].fightPositionY);
    }
    for (var j = 0; j < this.enemyCharacters.length; j++) {
      const baseX = 85;
      const baseY = 5;
      const spacing = this.fightData!.length > 1 ? 15 / (this.fightData!.length - 1) : 0;
      this.fightData![j].fightPositionX = baseX + this.getRandomPercentage(5);
      this.fightData![j].fightPositionY = baseY - (spacing * (this.fightData!.length - 1) / 2) + (spacing * j) + this.getRandomPercentage(5);
      this.updateActorPosition(this.enemyCharacters.get(j)!.nativeElement, this.fightData![j].fightPositionX, this.fightData![j].fightPositionY);
    }
  }

  aggroAndMove(actor: Character, actorIndex: number, friendly: boolean, enemies: Character[]) {
    if (enemies.length === 0) return;
    const distances = enemies.map(enemy => enemy.dead ? 9999 : this.calculateDistance(actor, enemy));
    const closestEnemyIndex = distances.indexOf(Math.min(...distances));
    this.moveTowardsOrAttack(actor, actorIndex, friendly, enemies[closestEnemyIndex]);
  }

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
      y: pawnRect.top  - bfRect.top  + pawnRect.height / 2,
    };
  }

  getAttackRangePixels(actor: Character): number {
    const rangePercent = this.baseAttackRange + (actor.stats.dexterity * 0.5) + (actor.class?.attackRange || 0);
    return this.percentageToPixels(rangePercent, true);
  }

  calculateDistance(actor: Character, enemy: Character): number {
    const dxPx = (actor.fightPositionX - enemy.fightPositionX) * this.battlefieldWidth / 100;
    const dyPx = (actor.fightPositionY - enemy.fightPositionY) * this.battlefieldHeight / 100;
    return Math.sqrt(dxPx * dxPx + dyPx * dyPx);
  }

  moveTowardsOrAttack(actor: Character, actorIndex: number = 0, friendly: boolean, target: Character) {
    const dxPx = (target.fightPositionX - actor.fightPositionX) * this.battlefieldWidth / 100;
    const dyPx = (target.fightPositionY - actor.fightPositionY) * this.battlefieldHeight / 100;
    const distance = Math.sqrt(dxPx * dxPx + dyPx * dyPx);
    const angle = Math.atan2(dyPx, dxPx);
    const attackRange = this.getAttackRangePixels(actor);

    if (distance <= attackRange) {
      this.musicService.playSound('attack');
      target.damaged = true;
      setTimeout(() => { target.damaged = false; }, 500);

      if (actor.class && actor.class.attackRange > 0) {
        // Ranged → Pixel Slash
        const senderCenter = this.getPawnCenterPx(actor);
        const missileEl = this.createSlashMissileElement(senderCenter.x, senderCenter.y);
        const missileAnimation: FightAnimation = {
          missileImageSource: '/assets/animations/slash.gif',
          id: this.animations.length + 1,
          x: senderCenter.x,
          y: senderCenter.y,
          target,
          rotationAngle: angle,
          explodeFn: this.processDamage.bind(this, actor, actorIndex, friendly, target),
          nativeElement: missileEl,
        };
        this.animations.push(missileAnimation);
      } else {
        // Melee → direct damage
        this.processDamage(actor, actorIndex, friendly, target);
      }
    } else {
      //this.uiService.pushText(`${actor.name} moved closer to ${target.name}.`);
      const moveSpeedPx = (this.baseMoveSpeed + (actor.stats.dexterity * 0.3)) / 100 * this.battlefieldWidth;
      const moveDistancePx = Math.min(moveSpeedPx, distance);
      actor.fightPositionX = Math.max(5, Math.min(95, actor.fightPositionX + Math.cos(angle) * moveDistancePx / this.battlefieldWidth * 100));
      actor.fightPositionY = Math.max(10, Math.min(90, actor.fightPositionY + Math.sin(angle) * moveDistancePx / this.battlefieldHeight * 100));
      const el = friendly
        ? this.partyCharacters.get(actorIndex)?.nativeElement
        : this.enemyCharacters.get(actorIndex)?.nativeElement;
      if (el) this.updateActorPosition(el, actor.fightPositionX, actor.fightPositionY);
    }
  }

  /** Creates the pixel-slash GIF missile element (melee ranged attacks). */
  createSlashMissileElement(centerXPx: number, centerYPx: number): HTMLElement {
    const missile = document.createElement('img') as HTMLImageElement;
    missile.src = '/assets/animations/slash.gif';
    missile.className = 'missile-slash';
    missile.style.transform = `translate(${centerXPx - this.missileHalf}px, ${centerYPx - this.missileHalf}px)`;
    this.battlefield.nativeElement.appendChild(missile);
    return missile;
  }

  processDamage(actor: Character, actorIndex: number, friendly: boolean, target: Character) {
    const attackData = this.fightManager.processAttack(actor, target, false);
    const targetCenter = this.getPawnCenterPx(target);
    const isCrit = false; // extend later if crit system added

    //this.uiService.pushText(`${actor.name} attacked ${target.name}, making him lose ${attackData.damage} points!`);
    this.speak(`${actor.name} strikes ${target.name} for ${attackData.damage} damage!`);
    this.uiService.shake(100 * attackData.damage);

    // FX: damage number + clash burst
    this.pushDamageNumber(attackData.damage, isCrit ? 'crit' : 'damage', targetCenter.x, targetCenter.y - 20);
    this.pushClash(targetCenter.x, targetCenter.y, isCrit);

    // Black flash on heavy hit (≥ 50% max HP)
    const maxHp = target.stats.constitution;
    if (maxHp > 0 && attackData.damage / maxHp >= 0.5) {
      this.triggerBlackFlash();
    }

    if (attackData.killed) {
      this.musicService.playSound('killed');
      const side = friendly ? 'enemy' : 'party';
      this.pushShatter(targetCenter.x, targetCenter.y, side);
      this.speak(`${target.name} has fallen!`, 'death');

      if (friendly) {
        const deadEnemy = this.fightData?.find(e => e.id === target.id);
        if (deadEnemy) deadEnemy.dead = true;
        // Check for victory
        if (this.fightData?.every(e => e.dead)) {
          setTimeout(() => this.triggerVictory(), 400);
        }
      } else {
        const deadMember = this.partyData.find(p => p.id === target.id);
        if (deadMember) deadMember.dead = true;
      }
    }
  }

  getActionRangeDiameter(actor: Character) {
    if (!this.action.actionType) {
      return { diameter: '200px', top: '-150px', left: '-50px' };
    } else {
      const rangePixels = this.getAttackRangePixels(actor);
      const diameter = rangePixels * 2;
      const top = -diameter / 2 - this.pawnHalfH;
      const left = -diameter / 2 + this.pawnHalfW;
      return {
        diameter: `${diameter}px`,
        top: `${top}px`,
        left: `${left}px`,
      };
    }
  }

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

  moveAttackButtonClicked() {
    this.action.actionType = 'attack';
    this.selectedSkill = undefined;
    this.musicService.playSound('range-open');
  }

  skillButtonClicked() {
    this.action.actionType = 'skill';
    this.selectedSkill = undefined;
    this.musicService.playSound('range-open');
  }

  selectSkillFromMenu(skill: Skill) {
    this.selectedSkill = skill;
  }

  castSelectedSkill(caster: Character, skill: Skill, target: Character) {
    const isSelf = caster.id === target.id;
    const from = this.getPawnCenterPx(caster);
    const to = this.getPawnCenterPx(target);

    const execute = () => {
      const result = this.fightManager.castSkill(caster, skill, target);
      //this.uiService.pushText(result.message);
      this.speak(`${caster.name} unleashes ${skill.name}!`, 'buff');
      const targetCenter = this.getPawnCenterPx(target);
      this.pushClash(targetCenter.x, targetCenter.y, false);
      if (result.stolenEquip) {
        this.runService.addItemToInventory(result.stolenEquip);
      }
      this.resetAction();
      this.isEnemyTurn = true;
      this.resumeFightLoop();
    };

    if (isSelf) {
      // Self-targeted: no flight, execute immediately
      execute();
    } else {
      // Fire particle trail, then execute on arrival
      this.createParticleTrailMissile(from, to, execute, 600);
    }
  }

  resetAction() {
    this.action.actionType = '';
    this.selectedSkill = undefined;
  }

  fightSpeedCurve(x: number): number {
    const m = -0.941;
    const b = 95.1;
    return m * x + b;
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
}
