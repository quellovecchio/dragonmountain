import { Injectable } from '@angular/core';
import { Character } from '../model/Actors/Character';
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';
import { ItemService } from './item.service';
import { Constants } from 'src/assets/constants';
import { Skill } from '../model/Skill';
import { DataService } from '../data.service';
import { UiService } from '../game/ui-layer/ui.service';
import { Buff, BuffType, BuffableStat } from '../model/Buff';
import { EffectType } from '../model/Interaction';
import { Equip } from '../model/items/Equip';

@Injectable({
  providedIn: 'root'
})
export class FightManagerService {

  public enemies: Character[] = [];
  party: PlayingCharacter[] = [];
  fighting: boolean = false;

  //did last attack kill the enemy?
  public lastAttackKilled: boolean = false;

  constructor(private itemService: ItemService, private dataService: DataService, private uiService: UiService) { }

  startFight(enemies: Character[], party: PlayingCharacter[]) {
    this.fighting = true;
    enemies.forEach(enemy => enemy.class = this.dataService.getClassById(enemy.classId));
    this.enemies = enemies;
    this.party = party;
  }

  processAttack(attackingCharacter: Character, defendingCharacter: Character, magical: boolean): { damage: number, killed: boolean } {
    if (defendingCharacter) {
      // step 1: calulate damage
      console.log(attackingCharacter.name + " is attacking " + defendingCharacter.name);
      var killed = false;
      var damage = this.calculateDamage(attackingCharacter, defendingCharacter, magical);
      var updatedCharacter = defendingCharacter;
      var updatedHealthPoints = updatedCharacter.stats.healthPoints - damage;
      if (this.party.findIndex(el => { return el.name == defendingCharacter.name }) >= 0) {
        // update character in the party
        if (updatedHealthPoints > 0) {
          console.log("updated health points: " + updatedHealthPoints);
          this.party.map((el) => { if (el.name == defendingCharacter.name) el.stats.healthPoints = updatedHealthPoints });
        }
        else {
          console.log("target killed");
          killed = true;
          this.party.map((el) => { if (el.name == defendingCharacter.name) { el.stats.healthPoints = 0; el.dead = true } });
        }
      } else {
        //update character in enemy party
        // TODO VERY SERIOUS BUG if enemies are the same kind of enemy it fucks up everything
        if (updatedHealthPoints > 0) {
          this.enemies.map((el) => { if (el.id == defendingCharacter.id) el.stats.healthPoints = updatedHealthPoints });
        }
        else {
          killed = true;
          this.enemies.map((el) => { if (el.id == defendingCharacter.id) { el.stats.healthPoints = 0; el.dead = true } });
          if (this.isBattleOver())
            this.endFight();
        }
      }
      // go on finding next character in turn
      //this.currentCharacter = this.getNextTurnCharacter()? this.currentCharacter : this.currentCharacter;
      return { damage: damage, killed: killed };
    }
    // game over
    this.endFight();
    return { damage: 0, killed: false };
  }

  calculateDamage(attackingCharacter: Character, defendingCharacter: Character, magical: boolean) {
    var baseDamage: number = 0;
    var attackBuff: number = 0;
    var defenseBuff: number = 0;
    var finalDamage: number = 0;
    if (magical) {
      baseDamage = attackingCharacter.stats.wisdom;
      attackBuff = this.getActiveStatBoost(attackingCharacter, 'attack');
      // magic damage ignores armor/defense buffs intentionally
      finalDamage = baseDamage + attackBuff;
    } else {
      baseDamage = attackingCharacter.stats.strength;
      attackBuff = this.itemService.calculateAttackBuff(attackingCharacter)
        + this.getActiveStatBoost(attackingCharacter, 'attack')
        + this.getActiveStatBoost(attackingCharacter, 'strength');
      defenseBuff = this.itemService.calculateDefenseBuff(defendingCharacter)
        + this.getActiveStatBoost(defendingCharacter, 'defense')
        + this.getActiveStatBoost(defendingCharacter, 'constitution');
      finalDamage = baseDamage + attackBuff - defenseBuff;
    }
    if (Constants.DAMAGE_LOGGING) {
      console.log('actor attack: ' + attackingCharacter.stats.strength);
      console.log('attack buff: ' + attackBuff);
      console.log('defense buff: ' + defenseBuff);
      console.log('final damage: ' + finalDamage + ' - rounded to one? ' + ((finalDamage <= 0) ? 'Y' : 'N'));
    }
    // rule: 0 or negative damage gets rounded to 1
    return finalDamage <= 0 ? 1 : finalDamage;
  }

  /**
   * Applies a buff to a character — adds it to their activeBuffs list.
   * For statBoost buffs on Stats keys the stat is modified immediately;
   * equipment-derived stats (attack/defense) are handled at damage-calculation time.
   */
  applyBuff(target: Character, buff: Buff): void {
    target.activeBuffs.push(buff);
    if (buff.type === BuffType.statBoost && buff.stat && buff.stat in target.stats) {
      (target.stats as any)[buff.stat] += buff.power;
    }
  }

  /**
   * Removes a buff and reverts any immediate stat changes it applied.
   */
  expireBuff(target: Character, buff: Buff): void {
    target.activeBuffs = target.activeBuffs.filter(b => b !== buff);
    if (buff.type === BuffType.statBoost && buff.stat && buff.stat in target.stats) {
      (target.stats as any)[buff.stat] -= buff.power;
    }
  }

  /**
   * Called at the start of a character's turn.
   * Decrements buff durations, removes expired ones, and applies ongoing effects (poison).
   * Returns total poison damage dealt this tick.
   */
  tickBuffs(character: Character): number {
    let poisonDamage = 0;
    const expired: Buff[] = [];
    character.activeBuffs.forEach(buff => {
      if (buff.type === BuffType.poison) {
        poisonDamage += buff.power;
      }
      if (buff.duration > 0) {
        buff.duration--;
        if (buff.duration === 0) {
          expired.push(buff);
        }
      }
    });
    expired.forEach(b => this.expireBuff(character, b));
    return poisonDamage;
  }

  /**
   * Sums all active statBoost buffs for a given stat on a character.
   * Used at damage-calculation time for 'attack' and 'defense' bonuses
   * that aren't reflected directly in Stats (to avoid double-counting).
   */
  getActiveStatBoost(character: Character, stat: BuffableStat): number {
    return character.activeBuffs
      .filter(b => b.type === BuffType.statBoost && b.stat === stat)
      .reduce((sum, b) => sum + b.power, 0);
  }

  /** Returns true if the character has an active stun buff. */
  isStunned(character: Character): boolean {
    return character.activeBuffs.some(b => b.type === BuffType.stun);
  }

  /**
   * Returns the ID of the character this character is taunted to target,
   * or undefined if no taunt is active.
   */
  getTauntSourceId(character: Character): number | undefined {
    const taunt = character.activeBuffs.find(b => b.type === BuffType.taunt);
    return taunt?.sourceCharacterId;
  }

  deductSkillPoints(character: Character, skill: Skill): boolean {
    // returns false if spell can't be launched
    if (character.stats.skillPoints - skill.cost >= 0) {
      character.stats.skillPoints = character.stats.skillPoints - skill.cost;
      return true;
    } else
      return false;
  }

  /**
   * Central skill dispatch for in-battle skill use.
   * Deducts SP, executes the skill's effect, and returns a feedback message.
   * For steal, also returns the stolen item so the caller can add it to inventory.
   */
  castSkill(caster: Character, skill: Skill, target: Character): { message: string; stolenEquip?: Equip } {
    if (!this.deductSkillPoints(caster, skill)) {
      return { message: `${caster.name} doesn't have enough skill points to cast ${skill.name}!` };
    }

    switch (skill.effect) {
      case EffectType.magicDamage: {
        const result = this.processAttack(caster, target, true);
        const msg = result.killed
          ? `${caster.name} cast ${skill.name} on ${target.name} for ${result.damage} magic damage — they're dead!`
          : `${caster.name} cast ${skill.name} on ${target.name} for ${result.damage} magic damage!`;
        return { message: msg };
      }

      case EffectType.heal: {
        const healAmount = Math.max(1, skill.power * caster.stats.wisdom);
        const newHp = Math.min(target.stats.healthPoints + healAmount, target.stats.constitution);
        target.stats.healthPoints = newHp;
        // Mirror the change to the tracked array
        const inParty = this.party.find(p => p.id === target.id);
        if (inParty) inParty.stats.healthPoints = newHp;
        const inEnemies = this.enemies.find(e => e.id === target.id);
        if (inEnemies) inEnemies.stats.healthPoints = newHp;
        return { message: `${caster.name} cast ${skill.name} on ${target.name}, restoring ${healAmount} HP!` };
      }

      case EffectType.buffStat: {
        const stat = skill.effectTarget as BuffableStat;
        const buff = new Buff(BuffType.statBoost, skill.power, 3, stat, caster.id);
        this.applyBuff(target, buff);
        return { message: `${caster.name} cast ${skill.name}: ${target.name}'s ${stat} increased by ${skill.power} for 3 turns!` };
      }

      case EffectType.steal: {
        if (target.equipment && target.equipment.length > 0) {
          const randomIndex = Math.floor(Math.random() * target.equipment.length);
          const [stolenEquip] = target.equipment.splice(randomIndex, 1);
          return {
            message: `${caster.name} stole ${stolenEquip.name} from ${target.name}!`,
            stolenEquip
          };
        }
        return { message: `${caster.name} tried to steal from ${target.name} but found nothing!` };
      }

      case EffectType.taunt: {
        const tauntBuff = new Buff(BuffType.taunt, 0, 3, undefined, caster.id);
        this.applyBuff(target, tauntBuff);
        return { message: `${caster.name} taunted ${target.name}: they can only attack ${caster.name} for 3 turns!` };
      }

      default:
        return { message: `${caster.name} cast ${skill.name}...` };
    }
  }

  getEnemy(enemyIndex: number) {
    return this.enemies[enemyIndex];
  }

  isBattleOver() {
    return (this.enemies.reduce((sum, current) => sum + current.stats.healthPoints, 0) <= 0);
  }

  endFight() {
    this.fighting = false;
    this.enemies = [];
    this.party = [];
  }
}
