import { Injectable } from '@angular/core';
import { Item } from './model/items/Item';
import { Equip } from './model/items/Equip';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor() { }

  isEquip(item: Item) {
    let e = (item as Equip);
    return (e.attack || e.defense || e.buffs);
  }

  getItemAsEquip(item: Item) {
    return (item as Equip);
  }
}
