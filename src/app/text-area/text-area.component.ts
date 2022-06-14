import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements AfterViewInit {

  @ViewChild('textArea') textArea: ElementRef;

  currentText: string = "Welcome back to Dragon Mountain, traveler!";

  constructor() { }

  ngAfterViewInit(): void {
    this.textArea.nativeElement.addEventListener('change', this.focus());
  }

  pushText(text: string) {
    this.currentText = this.currentText + "&#10;" + text;
    //this.textArea.nativeElement.setSelectionRange(0, 0);
  }

  focus() {
    this.textArea.nativeElement.focus();
  }

}
