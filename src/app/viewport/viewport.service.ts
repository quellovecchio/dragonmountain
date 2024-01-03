import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ViewportService {

  enableViewport: boolean = false;

  textBuffer: string[] = [];

  constructor() { }

  isViewportEnabled(): boolean {
    return this.enableViewport;
  }

  setViewportEnabling(value: boolean): void {
    this.enableViewport = value;
  }

  pushText(text: string) {
    this.textBuffer.push(text);
  }

  talkToNpcPushText(actorName: string, text: string | string[]): void {
    if(typeof text === 'string') {
      this.textBuffer.push(`${actorName}: ${text}`);
    } else {
      this.textBuffer.push(`${actorName}: ${text[0]}`);
      // dialogue array case
      for(let i = 1; i < text.length; i++) {
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
