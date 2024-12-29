import { Injectable } from '@angular/core';
import { STARTING_STATS } from 'src/app/editor/diy/diy.component';
import { PlayingCharacter } from 'src/app/model/Actors/PlayingCharacter';
import { Item } from 'src/app/model/items/Item';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  public inventoryOpened: boolean = false;
  public inventoryDisabled: boolean = false;

  public actorMenuOpened: boolean = false;
  public displayedActorMenu: PlayingCharacter = new PlayingCharacter(STARTING_STATS);

  public shopOpened: boolean = false;
  public shopDisabled: boolean = false;
  public shopItems: Item[] = [];

  private selectedItem?: Item = undefined;

  enableUi: boolean = false;

  textBuffer: string[] = [];

  constructor() {
  }

  public getSelectedItem() {
    return this.selectedItem;
  }

  public setSelectedItem(item: Item | undefined) {
    this.selectedItem = item;
  }

  isUiEnabled(): boolean {
    return this.enableUi;
  }

  setViewportEnabling(value: boolean): void {
    this.enableUi = value;
  }

  pushText(text: string | string[]) {
    if (typeof text === 'string') {
      this.textBuffer.push(text);
    } else {
      for (let i = 0; i < text.length; i++) {
        this.textBuffer.push(text[i]);
      }
    }
  }

  talkToNpcPushText(actorName: string, text: string | string[]): void {
    if (typeof text === 'string') {
      this.textBuffer.push(`${actorName}: ${text}`);
    } else {
      this.textBuffer.push(`${actorName}: ${text[0]}`);
      // dialogue array case
      for (let i = 1; i < text.length; i++) {
        this.textBuffer.push(text[i]);
      }
    }
  }

  cleanTextBuffer() {
    this.textBuffer = [];
  }

  getTextBuffer(): string[] {
    return this.textBuffer;
  }

  toggleInventory() {
    this.inventoryDisabled = true;
    this.inventoryOpened = !this.inventoryOpened;
    setTimeout(() => { this.inventoryDisabled = false; }, 400);
  }

  toggleActorInfo(actor: PlayingCharacter) {
    this.displayedActorMenu = actor;
    if (this.actorMenuOpened) {
      this.actorMenuOpened = !this.actorMenuOpened;
    }
    setTimeout(() => {
      this.actorMenuOpened = !this.actorMenuOpened;
    }, 200);
  }

  toggleShop(items?: Item[]) {
    this.shopDisabled = true;
    if (items) {
      this.shopItems = items;
    }
    this.shopOpened = !this.shopOpened;
    if (this.shopOpened)
      // TODO customizable
      this.pushText("[Merchant]: Take a good look!");
    else
      // TODO customizable
      this.pushText("[Merchant]: Thanks for your business.");
  }
}
