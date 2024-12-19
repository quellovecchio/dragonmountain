import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EffectType } from 'src/app/model/Interaction';
import { Equip } from 'src/app/model/items/Equip';
import { Item } from 'src/app/model/items/Item';
import { FileService } from 'src/app/services/file.service';
import { ItemService } from 'src/app/services/item.service';

@Component({
  selector: 'app-dialog-item-editor',
  templateUrl: './dialog-item-editor.component.html',
  styleUrls: ['./dialog-item-editor.component.scss']
})
export class DialogItemEditorComponent implements OnInit {

  effectTypes = Object.keys(EffectType).filter(value => Number.isNaN(parseInt(value)));
  images = this.fileService.getAllItemsImagesFilePaths();

  item: Item | Equip;
  @ViewChild('equipCheckbox') equipCheckbox!: Input;
  isEquip = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Item, private fileService: FileService, private itemService: ItemService) {
    this.item = data;
    this.isEquip = this.itemService.isEquip(this.item);
  }

  ngOnInit(): void {
  }

  handleEquipChange(event: any) {
    if(event.target.checked) {
      // equip case
      // cast item to equip, add stats to equip
      var equip = this.item as Equip;
      equip.attack = 0;
      equip.defense = 0;
      equip.buffs = []; 
      this.item = equip;
      this.isEquip = true;
    } else {
      // not equip case
      // cast equip to item, remove stats
      var item: any = this.item as Item;
      delete item['attack'];
      delete item['defense'];
      delete item['buffs'];
      this.item = item;
      this.isEquip = false;
    }
  }

  asEvent(val: any) : Event { return val; }
}
