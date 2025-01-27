import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { STARTING_STATS } from 'src/app/editor/diy/diy.component';
import { PlayingCharacter } from 'src/app/model/Actors/PlayingCharacter';
import { Item } from 'src/app/model/items/Item';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  public inventoryOpened: boolean = false;
  public inventoryDisabled: boolean = false;
  private inventorySubject = new BehaviorSubject<Item[]>([]);
  public inventory$ = this.inventorySubject.asObservable();

  public actorMenuOpened: boolean = false;
  public displayedActorMenu: PlayingCharacter = new PlayingCharacter(STARTING_STATS);

  public shopOpened: boolean = false;
  public shopDisabled: boolean = false;
  private shopItemsSubject = new BehaviorSubject<Item[]>([]);
  public shopItems$ = this.shopItemsSubject.asObservable();

  private selectedItem?: Item = undefined;
  private selectedItemSubject = new BehaviorSubject<Item[]>([]);
  public selectedItem$ = this.selectedItemSubject.asObservable();

  enableUi: boolean = false;

  textBuffer: string[] = [];
  textAreaVisibility: boolean = false;

  constructor() {
  }

  isScreenPortrait(): boolean {
    return window.innerHeight > window.innerWidth;
  }

  public updateInventory(items: Item[]) {
    this.inventorySubject.next(items);
  }

  updateShopItems(items: Item[]) {
    this.shopItemsSubject.next(items);
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

  setTextAreaVisibility(value: boolean): void {
    this.textAreaVisibility = value;
  }

  getTextAreaVisibility(): boolean {
    return this.textAreaVisibility;
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

  openInventory() {
    this.inventoryDisabled = true;
    this.inventoryOpened = true;
    setTimeout(() => { this.inventoryDisabled = false; }, 400);
  }

  closeInventory() {
    this.inventoryDisabled = true;
    this.inventoryOpened = false;
    setTimeout(() => { this.inventoryDisabled = false; }, 400);
  }

  toggleActorInfo(actor: PlayingCharacter) {
    this.displayedActorMenu = actor;
    setTimeout(() => {
      this.actorMenuOpened = !this.actorMenuOpened;
    }, 200);
  }

  closeActorInfo() {
    this.actorMenuOpened = false;
  }

  toggleShop(items?: Item[]) {
    this.shopDisabled = true;
    if (items) {
      this.updateShopItems(items);
    }
    this.shopOpened = !this.shopOpened;
    if (this.shopOpened)
      // TODO customizable
      this.pushText("[Merchant]: Take a good look!");
    else
      // TODO customizable
      this.pushText("[Merchant]: Thanks for your business.");
  }

  closeShop(message: boolean = true) {
    this.shopOpened = false;
    if (message) this.pushText("[Merchant]: Thanks for your business.");
    this.updateShopItems([]);
  }
}
