import { OnInit, Component, ElementRef, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { Run } from '../model/Run';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements OnInit {

  @Input() run: Run;

  @ViewChild('textArea') textArea: ElementRef;

  currentText: string = "Welcome back to Dragon Mountain, traveler!";

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  pushText(text: string) {
    this.currentText = this.currentText + "&#10;" + text;
    if(this.textArea != undefined) {
      this.ref.detectChanges();
      this.textArea.nativeElement.scrollTop = this.textArea.nativeElement.scrollHeight;
    }
  }

}
