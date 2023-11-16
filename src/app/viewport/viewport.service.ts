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

  cleanTextBuffer() {
    this.textBuffer = [];
  }

  getTextBuffer(): string[] {
    return this.textBuffer;
  }
}
