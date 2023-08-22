import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Character } from '../model/Actors/Character';
import { Location } from '../model/Location';
import { Actor } from '../model/Actors/Actor';
import { Item } from '../model/Item';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ height: 0, width: 0, top: 0 }),
            animate('0.2s ease-out', 
                    style({ height: 500, width: 500, top: -500 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ height: 500, width: 500, top: -500 }),
            animate('0.2s ease-in', 
                    style({ height: 0, width: 0, top: 0 }))
          ]
        )
      ]
    )
  ]
})
export class LocationComponent implements OnInit {

  @Input() locationData?: Location;
  @Input() selectedItem?: Item = undefined;
  // action can be an Item, a Spell or anthing capable of interacting
  @Output() interactSignal = new EventEmitter<{ character: Character, action: any }>();
  @Output() backSignal = new EventEmitter<Location>();
  @Output() talkSignal = new EventEmitter<Actor>();
  @Output() fightSignal = new EventEmitter<Actor>();
  @Output() buyItemSignal = new EventEmitter<Item>();

  public shopOpened: boolean = false;
  public shopDisabled: boolean = false;
  public shopItems: Item[] = [];

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

  hasShop(actor: Actor) {
    return (actor.shop ? actor.shop.length > 0 : false);
  }

  toggleShop(actor?: Actor) {
    this.shopDisabled = true;
    if(actor) this.shopItems = actor.shop!;
    this.shopOpened = !this.shopOpened;
    setTimeout(() => { this.shopDisabled = false; }, 400);
  }

  buyItem(item: any) {
    console.log("temptatve bu")
    this.buyItemSignal.emit(item);
  }

  isFightable(a: Actor): any {
    return (a as Character).stats;
  }
}
