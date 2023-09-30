import { Injectable } from '@angular/core';
import { Item } from './model/items/Item';
import { Equip } from './model/items/Equip';
import { Character } from './model/Actors/Character';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor() { }

  calculateDefenseBuff(defendingCharacter: Character) {
    if(defendingCharacter.equipment && defendingCharacter.equipment.length > 0){
      var r = 0;
      defendingCharacter.equipment.forEach(element => {
        r = r + element.defense;
      });
      return r;
      // TODO handle buffs
    }
    return 0;
  }

  calculateAttackBuff(attackingCharacter: Character) {
    if(attackingCharacter.equipment && attackingCharacter.equipment.length > 0){
      var r = 0;
      attackingCharacter.equipment.forEach(element => {
        r = r + element.attack;
      });
      return r;
      // TODO handle buffs
    }
    return 0;
  }

  isEquip(item: Item) {
    let e = (item as Equip);
    return ((e.attack && e.attack > 0) || (e.defense && e.defense > 0) || (e.buffs && e.buffs.length > 0));
  }

  getItemAsEquip(item: Item) {
    return (item as Equip);
  }
}
