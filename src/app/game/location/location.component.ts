import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Character } from '../../model/Actors/Character';
import { Location } from '../../model/Location';
import { Actor } from '../../model/Actors/Actor';
import { Item } from '../../model/items/Item';
import { MatMenuTrigger } from '@angular/material/menu';
import { take } from 'rxjs';
import { Requirement } from 'src/app/model/Reqirement';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent implements OnInit {

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger | undefined;

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // check if the click is inside the box
    if(this.eRef.nativeElement.contains(event.target)) {
      this.contextMenuPosition.x = event.y;
      this.contextMenuPosition.y = event.x;
      this.openMenu();
    }
  }

  contextMenuPosition = {x: 0, y: 0};

  @Input() locationData?: Location;
  @Input() selectedItem?: Item = undefined;
  // action can be an Item, a Spell or anthing capable of interacting
  @Output() interactSignal = new EventEmitter<{ character: Character, action: any }>();
  @Output() backSignal = new EventEmitter<Location>();
  @Output() talkSignal = new EventEmitter<Actor>();
  @Output() fightSignal = new EventEmitter<Actor>();
  @Output() openShopSignal = new EventEmitter<Item[]>();
  @Output() restSignal = new EventEmitter<Item[]>();

  selectedActor?: Actor = undefined;

  constructor(private eRef: ElementRef) { }

  ngOnInit(): void {
  }

  openMenu() {
    this.menuTrigger?.menuOpened.pipe(take(1)).subscribe(() => {
      const menu = document.getElementsByClassName('location-menu')[0] as HTMLElement;
      menu.focus();
      menu.style.position = 'absolute';
      menu.style.top = `${this.contextMenuPosition.x}px`;
      menu.style.left = `${this.contextMenuPosition.y}px`;
    });

    this.menuTrigger?.openMenu();
  }

  interact(character: Character) {
    this.interactSignal.emit({ character: character, action: this.selectedItem });
  }

  goBackToScene() {
    this.backSignal.emit(this.locationData);
  }

  talk(a: Actor) {
    this.talkSignal.emit(a);
    // BUG: clearanceRequirements and clearanceDialog always empty

    var talkRequirements = a.clearanceRequirements.filter((requirement: Requirement) => requirement.type == 'talk');
    if(talkRequirements.length > 0) {
      var newRequirements = a.clearanceRequirements.filter((requirement: Requirement) => requirement.type != 'talk');
      a.clearanceRequirements = newRequirements;
    }
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

  setSelectedActor(actor: Actor) {
    this.selectedActor = actor;
  }

  locked() {
    var clearanceArray = this.locationData!.actors.map((el: Actor) => el.clearanceRequirements);
    var cleared = clearanceArray.every(innerArr => Array.isArray(innerArr) && innerArr.length === 0);
    //console.log(clearanceArray + ' ' + cleared);
    return cleared;
  }

}
