import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Character } from '../../model/Actors/Character';
import { Location } from '../../model/Location';
import { Actor } from '../../model/Actors/Actor';
import { Item } from '../../model/items/Item';
import { MatMenuTrigger } from '@angular/material/menu';
import { take } from 'rxjs';
import { Requirement } from 'src/app/model/Requirement';
import { Stats } from 'src/app/model/Stats';
import { RunService } from 'src/app/services/run.service';
import { Interaction } from 'src/app/model/Interaction';
import { UiService } from '../ui-layer/ui.service';

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
  @Output() reviveSignal = new EventEmitter<void>();

  selectedActor?: Actor = undefined;

  constructor(private eRef: ElementRef, public uiService: UiService, public runService: RunService) { }

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

  clearSelectedActor() {
    this.selectedActor = undefined;
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

  canRevive(actor: Actor): boolean {
    return !!actor.revive && this.runService.getRun().party.some(p => p.dead);
  }

  revive() {
    this.reviveSignal.emit();
  }

  castSkillOnActor(actor: Actor) {
    const skill = this.uiService.getSelectedSkill();
    const caster = this.uiService.getSelectedSkillCaster();
    if (skill && caster) {
      this.runService.castSkillOnActor(caster, skill, actor as Character);
      this.uiService.setSelectedSkill(undefined);
      this.uiService.setSelectedSkillCaster(undefined);
    }
  }

  hasDialogue(a: Actor) {
    return a.dialogue ? true : false;
  }

  toggleShop(actor: Actor) {
    this.uiService.toggleShop(actor.shop);
  }

  hasShop(actor: Actor) {
    return (actor.shop ? actor.shop.length > 0 : false);
  }

  canMakeYouRest(actor: Actor) {
    return (actor.rest ? actor.rest : false);
  }

  isFightable(a: Character): any {
    let statsZero = new Stats();
    return JSON.stringify(a.stats) != JSON.stringify(statsZero);
  }

  setSelectedActor(actor: Actor) {
    this.selectedActor = actor;
  }

  locked() {
    var clearanceArray: Interaction[] = [];
    this.locationData!.actors.forEach((c: Actor) => {
      c.interactions.forEach((i: Interaction) => {
        if(i.locksDoor)
          clearanceArray.push(i);
      })
    });
    return clearanceArray.length > 0;
  }

}
