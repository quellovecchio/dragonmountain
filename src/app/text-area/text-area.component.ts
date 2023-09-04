import { OnInit, Component, ElementRef, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { Run } from '../model/Run';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements OnInit {

  currentText: string[] = [];
  needsCleanup: boolean = false;

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  pushText(text: string) {
    if(this.needsCleanup) {
      this.currentText = [];
      this.needsCleanup = false;
    }
    this.currentText = [...this.currentText, text];
  }

  cleanBuffer() {
    this.needsCleanup = true;
  }

}
