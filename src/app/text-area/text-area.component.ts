import { OnInit, Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements OnInit {

  @ViewChild('textArea') textArea: ElementRef;

  currentText: string = "Welcome back to Dragon Mountain, traveler!";

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  pushText(text: string) {
    this.currentText = this.currentText + "&#10;" + text;
    if(this.textArea != undefined) {
      this.textArea.nativeElement.scrollTop = this.textArea.nativeElement.scrollHeight;
    }
  }

}
