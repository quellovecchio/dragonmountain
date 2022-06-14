import { OnInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements OnInit {

  @ViewChild('textArea') textArea: ElementRef;

  currentText: string = "Welcome back to Dragon Mountain, traveler!";

  constructor() { }

  ngOnInit(): void {
  }

  pushText(text: string) {
    this.currentText = this.currentText + "&#10;" + text;
    //
  }

  focus() {
    this.textArea.nativeElement.focus();
    this.textArea.nativeElement.setSelectionRange(0, 0);
  }

}
