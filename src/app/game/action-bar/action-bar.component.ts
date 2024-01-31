import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Run } from '../../model/Run';
import { animate, style, transition, trigger } from '@angular/animations';
import { RunState } from '../../model/RunState';
import { Actor } from '../../model/Actors/Actor';
import { PlayingCharacter } from '../../model/Actors/PlayingCharacter';
import { Stats } from '../../model/Stats';
import { ItemService } from '../../services/item.service';
import { ViewportService } from '../viewport/viewport.service';
import { Item } from '../../model/items/Item';
import { Character } from '../../model/Actors/Character';
import { RunService } from '../../services/run.service';
import { Skill } from '../../model/Skill';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, width: 0, top: 0 }),
            animate('0.2s ease-out',
              style({ height: 500, width: 200, top: 100 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: 500, width: 200, top: 100 }),
            animate('0.2s ease-in',
              style({ height: 0, width: 0, top: 0 }))
          ]
        )
      ]
    )
  ]
})
export class ActionBarComponent implements OnInit {

  @Input() run: Run = new Run();
  @Output() onItemSelect = new EventEmitter<any>();
  @Output() refreshLocationsSignal = new EventEmitter<any>();
  @Output() moveToBossfightSignal = new EventEmitter<any>();
  @Output() equipItemSignal = new EventEmitter<{equipSlot: number, actor: Actor}>();
  @Output() interactOnPartyActorSignal = new EventEmitter<{action: Item, actor: Actor}>();
  public inventoryOpened: boolean = false;
  public inventoryDisabled: boolean = false;
  public actorMenuOpened: boolean = false;
  public displayedActorMenu: PlayingCharacter = new PlayingCharacter();
  public selectedItem?: Item = undefined;

  constructor(public itemService: ItemService, private viewportService: ViewportService, private runService: RunService) { }

  ngOnInit(): void {
  }

  update(updatedRun: Run) {
    this.run = updatedRun;
  }

  toggleInventory() {
    this.onItemSelect.emit(undefined);
    this.inventoryDisabled = true;
    this.inventoryOpened = !this.inventoryOpened;
    setTimeout(() => { this.inventoryDisabled = false; }, 400);
  }

  toggleActorInfo(actor: PlayingCharacter) {
    if(this.run.state != RunState.Fight) {
      if(!this.selectedItem) {
        this.actorMenuOpened = !this.actorMenuOpened;
        this.displayedActorMenu = actor;
      } else {
        this.interactOnPartyActorSignal.emit({action: this.selectedItem!, actor: (actor as Character)});
        this.selectedItem = undefined;
      }
    }
  }

  selectItem(item: any) {
    this.inventoryOpened = !this.inventoryOpened;
    setTimeout(() => { this.inventoryDisabled = false; }, 400);
    console.log(item.name + " selected")
    this.viewportService.pushText(item.name + " selected");
    this.selectedItem = item;
    this.onItemSelect.emit(item);
  }

  selectSkill(skill: Skill) {
    /*this.inventoryOpened = !this.inventoryOpened;
    setTimeout(() => { this.inventoryDisabled = false; }, 400);
    this.viewportService.pushText(item.name + " selected");
    this.selectedItem = item;
    this.onItemSelect.emit(item);*/

    console.log(skill.name + " selected");
  }

  refreshLocations() {
    this.refreshLocationsSignal.emit();
  }

  moveToBossfightLocation() {
    this.moveToBossfightSignal.emit();
  }

  equipItem(slot: number) {
    this.equipItemSignal.emit({equipSlot:slot, actor:this.displayedActorMenu});
  }

  isExploreEnabled() {
    return (this.run.state == RunState.Exploration && this.run.experience > 0);
  }

  isMoveToBossfightEnabled() {
    return (this.run.state == RunState.Exploration && (this.run.experience >= (4 * this.run.level) || !this.run.stage.bossfightLocked));
  }

  getStatsToDisplay(stats: Stats) {
    return [
      { name: "strength", value: stats.strength },
      { name: "dexterity", value: stats.dexterity },
      { name: "constitution", value: stats.constitution },
      { name: "intelligence", value: stats.intelligence },
      { name: "wisdom", value: stats.wisdom },
      { name: "charisma", value: stats.charisma },
    ]
  }

  boostStat(actor: PlayingCharacter, statName: string) {
    this.run.experience = this.run.experience - 1;
    (actor.stats as any)[statName] = (actor.stats as any)[statName] + 1;
    var newSkillData = actor.class?.skillTree.find((el: { skillId: number; unlockLevel: number; unlockStat: string; }) => {return (el.unlockLevel == (actor.stats as any)[statName] && el.unlockStat == statName)});
    if(newSkillData) {
      var newSkill = this.runService.getSkillById(newSkillData.skillId);
      if (newSkill) {
        actor.skills.push(newSkill);
        this.viewportService.pushText("Hold On... " + actor.name + " unlocked a new Skill, " + newSkill.name + "!");
      }
    }
  }

  equipable() {
    return (this.selectedItem && this.itemService.isEquip(this.selectedItem))
  }

  getCurrentPlayerSkills(): {"skills": Skill[]} {
    return {"skills": this.displayedActorMenu.skills};
  }
}
