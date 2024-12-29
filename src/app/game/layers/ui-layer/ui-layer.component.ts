import packageJson from '../../../../../package.json';
import { trigger, transition, style, animate } from '@angular/animations';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { PlayingCharacter } from 'src/app/model/Actors/PlayingCharacter';
import { Equip } from 'src/app/model/items/Equip';
import { Item } from 'src/app/model/items/Item';
import { Skill } from 'src/app/model/Skill';
import { RunService } from 'src/app/services/run.service';
import { UiService } from './ui.service';
import { ItemService } from 'src/app/services/item.service';
import { Stats } from 'src/app/model/Stats';
import { DataService } from 'src/app/data.service';
import { MatTableDataSource } from '@angular/material/table';

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
    ),
    trigger(
      'inOutAnimationShop',
      [
        transition(
          ':enter',
          [
            style({ height: 0, top: 0 }),
            animate('0.2s ease-out',
              style({ height: '80%', top: '5%' }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: '65%', top: '5%' }),
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

  inventoryDataSource: MatTableDataSource<Item> = new MatTableDataSource();
  shopDataSource: MatTableDataSource<Item> = new MatTableDataSource();

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

  constructor(public runService: RunService, public uiService: UiService, private itemService: ItemService, public dataService: DataService) { }

  ngOnInit(): void {
    this.selectedItem = this.uiService.getSelectedItem();
    setInterval(() => {
      this.inventoryDataSource.data = this.runService.getRun().inventory.items;
    }, 500);
    setInterval(() => {
      this.shopDataSource.data = this.uiService.shopItems;
    }, 501);
    setTimeout(() => {
      this.uiService.toggleInventory();
    }, 1500);
    setTimeout(() => {
      this.uiService.toggleActorInfo(this.runService.getRun().party[0]);
    }, 2000);
  }

  interact(interactionData: any) {
    this.selectedItem = undefined;
    if(this.itemService.isItem(interactionData.action))
      this.runService.removeItemFromInventory(interactionData.action);
    this.runService.interact({character: interactionData.actor, action: interactionData.action})
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
        var characterIndex = this.runService.getRun().party.findIndex(el => { return el.name == this.uiService.displayedActorMenu.name });
        if (!this.runService.getRun().party[characterIndex].equipment[slot]) {
          this.runService.getRun().party[characterIndex].equipment[slot] = newEquip;
          this.uiService.pushText(newEquip.name + " is equipped by " + this.uiService.displayedActorMenu.name);
          this.selectedItem = undefined;
        } else {
          let oldEquip = this.runService.getRun().party[characterIndex].equipment[slot];
          this.runService.getRun().party[characterIndex].equipment[slot] = newEquip;
          this.runService.getRun().inventory.items.push(oldEquip);
          this.uiService.pushText(newEquip.name + " is equipped by " + this.uiService.displayedActorMenu.name);
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
    return { "skills": this.uiService.displayedActorMenu.skills };
  }

}
