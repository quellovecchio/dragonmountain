import { Injectable } from '@angular/core';
import { Item } from 'src/app/model/items/Item';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  private selectedItem?: Item = undefined;
  
  enableViewport: boolean = false;

  textBuffer: string[] = [];

  constructor() { }

  public getSelectedItem() {
    return this.selectedItem;
  }

  public setSelectedItem(item: Item | undefined) {
    this.selectedItem = item;
  }

  isViewportEnabled(): boolean {
    return this.enableViewport;
  }

  setViewportEnabling(value: boolean): void {
    this.enableViewport = value;
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
}
