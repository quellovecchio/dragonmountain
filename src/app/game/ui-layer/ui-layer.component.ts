import packageJson from '../../../../package.json';
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
import { Subscription } from 'rxjs';

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
              style({ height: '65%', top: '12%' }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: '65%', top: '12%' }),
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

  private inventorySubscription!: Subscription;
  private shopSubscription!: Subscription;

  inventoryDataSource: MatTableDataSource<Item> = new MatTableDataSource();
  shopDataSource: MatTableDataSource<Item> = new MatTableDataSource();

  constructor(public runService: RunService, public uiService: UiService, private itemService: ItemService, public dataService: DataService) { }

  ngOnInit(): void {
    this.inventorySubscription = this.uiService.inventory$.subscribe(items => {
      this.inventoryDataSource.data = items;
    });
    this.shopSubscription = this.uiService.shopItems$.subscribe(items => {
      this.shopDataSource.data = items;
    });
    if (!this.uiService.isScreenPortrait()) {
      setTimeout(() => {
        this.uiService.toggleInventory();
      }, 1500);
      setTimeout(() => {
        this.uiService.toggleActorInfo(this.runService.getRun().party[0]);
      }, 2000);
    }
  }

  ngOnDestroy() {
    if (this.inventorySubscription) {
      this.inventorySubscription.unsubscribe();
    }
    if (this.shopSubscription) {
      this.shopSubscription.unsubscribe();
    }
  }

  interact(interactionData: any) {
    this.uiService.setSelectedItem(undefined);
    if (this.itemService.isItem(interactionData.action))
      this.runService.removeItemFromInventory(interactionData.action);
    this.runService.interact({ character: interactionData.actor, action: interactionData.action })
  }

  selectItem(item: Item) {
    this.uiService.setSelectedItem(item);
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
    this.runService.removeItemFromInventory(this.uiService.getSelectedItem()!);
    if (this.uiService.getSelectedItem()) {
      let newEquip = (this.uiService.getSelectedItem() as Equip);
      if (newEquip.attack || newEquip.defense || newEquip.buffs.length > 0) {
        // update character in the party
        var characterIndex = this.runService.getRun().party.findIndex(el => { return el.name == this.uiService.displayedActorMenu.name });
        if (!this.runService.getRun().party[characterIndex].equipment[slot]) {
          this.runService.getRun().party[characterIndex].equipment[slot] = newEquip;
          this.uiService.pushText(newEquip.name + " is equipped by " + this.uiService.displayedActorMenu.name);
          this.uiService.setSelectedItem(undefined);
        } else {
          let oldEquip = this.runService.getRun().party[characterIndex].equipment[slot];
          this.runService.getRun().party[characterIndex].equipment[slot] = newEquip;
          this.runService.getRun().inventory.items.push(oldEquip);
          this.uiService.pushText(newEquip.name + " is equipped by " + this.uiService.displayedActorMenu.name);
          this.uiService.setSelectedItem(undefined);
        }
      } else {
        this.uiService.pushText("The selected item is not an equipment");
        this.uiService.setSelectedItem(undefined);
      }

    } else {
      this.uiService.pushText("You have to select an item from inventory to equip it.");
      this.uiService.setSelectedItem(undefined);
    }
    this.uiService.setSelectedItem(undefined);

  }

  equipable() {
    return (this.uiService.getSelectedItem() && this.itemService.isEquip(this.uiService.getSelectedItem()!))
  }

  getCurrentPlayerSkills(): { "skills": Skill[] } {
    return { "skills": this.uiService.displayedActorMenu.skills };
  }

  buy(item: any) {
    // TODO: check money, if not enough error message
    if (this.runService.getRun().inventory.money < item.moneyValue) {
      this.uiService.pushText("[Merchant]: Sorry pal, that's too much money for you!");
    } else {
      this.runService.getRun().inventory.money = this.runService.getRun().inventory.money - item.moneyValue;
      this.uiService.pushText("That's a great deal! It's yours.");
      this.runService.getRun().inventory.items.push(item);
      this.uiService.updateInventory(this.runService.getRun().inventory.items);
    }
  }

}
