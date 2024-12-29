import packageJson from '../../../../../package.json';
import { trigger, transition, style, animate } from '@angular/animations';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { STARTING_STATS } from 'src/app/editor/diy/diy.component';
import { Character } from 'src/app/model/Actors/Character';
import { PlayingCharacter } from 'src/app/model/Actors/PlayingCharacter';
import { Equip } from 'src/app/model/items/Equip';
import { Item } from 'src/app/model/items/Item';
import { RunState } from 'src/app/model/RunState';
import { Skill } from 'src/app/model/Skill';
import { RunService } from 'src/app/services/run.service';
import { UiService } from './ui.service';
import { ItemService } from 'src/app/services/item.service';
import { Stats } from 'src/app/model/Stats';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-ui-layer',
  templateUrl: './ui-layer.component.html',
  styleUrls: ['./ui-layer.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, top: 0 }),
            animate('0.2s ease-out',
              style({ height: '70%', top: 100 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: '70%', top: 100 }),
            animate('0.2s ease-in',
              style({ height: 0, top: 0 }))
          ]
        )
      ]
    )
  ]
})
export class UiLayerComponent implements OnInit {

  public version: string = packageJson.version;

  selectedItem?: Item = undefined;

  // image following cursor when an item is selected
  @ViewChild('followCursorImg', { static: false }) followCursorImg!: ElementRef;

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.selectedItem) {
      if (this.followCursorImg) {
        const imgElement = this.followCursorImg.nativeElement;

        const containerRect = imgElement.parentElement.getBoundingClientRect();

        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;

        const offsetX = mouseX + 50; // TODO remove addition?
        const offsetY = mouseY + 50; // TODO remove addition?

        imgElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
    }
  }

  public inventoryOpened: boolean = false;
  public inventoryDisabled: boolean = false;
  inventoryDataSource: MatTableDataSource<Item> = new MatTableDataSource();

  public actorMenuOpened: boolean = false;
  public displayedActorMenu: PlayingCharacter = new PlayingCharacter(STARTING_STATS);

  constructor(public runService: RunService, public uiService: UiService, private itemService: ItemService, public dataService: DataService) { }

  ngOnInit(): void {
    this.inventoryDataSource.data = this.runService.getRun().inventory.items;
    this.selectedItem = this.uiService.getSelectedItem();
    setTimeout(() => {
      this.toggleInventory();
    }, 1500);
    setTimeout(() => {
      this.toggleActorInfo(this.runService.getRun().party[0]);
    }, 2000);
  }

  toggleActorInfo(actor: PlayingCharacter) {
    if (this.runService.getRun().state != RunState.Fight) {
      if (!this.selectedItem) {
        this.displayedActorMenu = actor;
        if (this.actorMenuOpened) {
          this.actorMenuOpened = !this.actorMenuOpened;
        }
        setTimeout(() => {
          this.actorMenuOpened = !this.actorMenuOpened;
        }, 200);
        //this.uiService.setViewportEnabling(!(this.actorMenuOpened || this.inventoryOpened));
      } else {
        this.interact({ action: this.selectedItem!, actor: (actor as Character) });
        this.selectedItem = undefined;
      }
    }
  }

  interact(interactionData: any) {
    this.selectedItem = undefined;
    if(this.itemService.isItem(interactionData.action))
      this.runService.removeItemFromInventory(interactionData.action);
    this.runService.interact({character: interactionData.actor, action: interactionData.action})
  }

  toggleInventory() {
    this.inventoryDisabled = true;
    this.inventoryOpened = !this.inventoryOpened;
    //this.uiService.setViewportEnabling(!(this.actorMenuOpened || this.inventoryOpened));
    this.inventoryDataSource.data = this.runService.getRun().inventory.items;
    setTimeout(() => { this.inventoryDisabled = false; }, 400);
  }

  selectItem(item: Item) {
    this.selectedItem = item;
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
    this.runService.getRun().experience = this.runService.getRun().experience - 1;
    (actor.stats as any)[statName] = (actor.stats as any)[statName] + 1;
    var newSkillData = actor.class?.skillTree.find((el: { skillId: number; unlockLevel: number; unlockStat: string; }) => { return (el.unlockLevel == (actor.stats as any)[statName] && el.unlockStat == statName) });
    if (newSkillData) {
      var newSkill = this.dataService.getSkillById(newSkillData.skillId);
      if (newSkill) {
        actor.skills.push(newSkill);
        this.uiService.pushText("Hold On... " + actor.name + " unlocked a new Skill, " + newSkill.name + "!");
      }
    }
  }

  selectSkill(skill: Skill) {
    console.log(skill.name + " selected");
  }

  equipItem(slot: number) {
    this.runService.removeItemFromInventory(this.selectedItem!);
    if (this.selectedItem) {
      let newEquip = (this.selectedItem as Equip);
      if (newEquip.attack || newEquip.defense || newEquip.buffs.length > 0) {
        // update character in the party
        var characterIndex = this.runService.getRun().party.findIndex(el => { return el.name == this.displayedActorMenu.name });
        if (!this.runService.getRun().party[characterIndex].equipment[slot]) {
          this.runService.getRun().party[characterIndex].equipment[slot] = newEquip;
          this.uiService.pushText(newEquip.name + " is equipped by " + this.displayedActorMenu.name);
          this.selectedItem = undefined;
        } else {
          let oldEquip = this.runService.getRun().party[characterIndex].equipment[slot];
          this.runService.getRun().party[characterIndex].equipment[slot] = newEquip;
          this.runService.getRun().inventory.items.push(oldEquip);
          this.uiService.pushText(newEquip.name + " is equipped by " + this.displayedActorMenu.name);
          this.selectedItem = undefined;
        }
      } else {
        this.uiService.pushText("The selected item is not an equipment");
        this.selectedItem = undefined;
      }

    } else {
      this.uiService.pushText("You have to select an item from inventory to equip it.");
      this.selectedItem = undefined;
    }
    this.selectedItem = undefined;
  }

  equipable() {
    return (this.selectedItem && this.itemService.isEquip(this.selectedItem))
  }

  getCurrentPlayerSkills(): { "skills": Skill[] } {
    return { "skills": this.displayedActorMenu.skills };
  }

}
