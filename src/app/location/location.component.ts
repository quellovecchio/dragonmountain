import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Character } from '../model/Actors/Character';
import { Location } from '../model/Location';
import { Actor } from '../model/Actors/Actor';
import { Item } from '../model/Item';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit {

  @Input() locationData?: Location;
  @Input() selectedItem?: Item = undefined;
  // action can be an Item, a Spell or anthing capable of interacting
  @Output() interactSignal = new EventEmitter<{ character: Character, action: any }>();
  @Output() backSignal = new EventEmitter<Location>();
  @Output() talkSignal = new EventEmitter<Actor>();
  @Output() fightSignal = new EventEmitter<Actor>();
  @Output() openShopSignal = new EventEmitter<Item[]>();
  @Output() restSignal = new EventEmitter<Item[]>();

  constructor() { }

  ngOnInit(): void {
  }

  interact(character: Character) {
    this.interactSignal.emit({ character: character, action: this.selectedItem });
  }

  goBackToScene() {
    this.backSignal.emit(this.locationData);
  }

  talk(a: Actor) {
    this.talkSignal.emit(a);
  }

  engageCombat(a: Actor): any {
    this.fightSignal.emit(a);
  }

  rest() {
    this.restSignal.emit();
  }

  hasDialogue(a: Actor) {
    return a.dialogue ? true : false;
  }

  useItemOn(actor: Actor) {
    console.log("used " + this.selectedItem?.name + " on " + actor.name);
    this.interact(actor as Character);
    this.selectedItem = undefined;
  }

  // duped code, TODO implement interface with method
  getActorWidth(): number {
    if (this.locationData?.actors?.length == 3) {
      return 33;
    } else if (this.locationData?.actors?.length == 2) {
      return 49;
    } else {
      return 99;
    }
  }

  toggleShop(actor: Actor) {
    this.openShopSignal.emit(actor.shop!);
  }

  hasShop(actor: Actor) {
    return (actor.shop ? actor.shop.length > 0 : false);
  }

  canMakeYouRest(actor: Actor) {
    return (actor.rest ? actor.rest : false);
  }

  isFightable(a: Actor): any {
    return (a as Character).stats;
  }
}
