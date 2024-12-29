import { OnInit, Component, ElementRef, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { interval, isEmpty, startWith, switchMap, takeWhile } from 'rxjs';
import { UiService } from 'src/app/game/layers/ui-layer/ui.service';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements OnInit {

  @Input() textSpeed!: number;

  currentText: string[] = [];
  textBuffer: string[] = [];
  needsCleanup: boolean = false;

  complete: boolean = false;

  constructor(private uiService: UiService) { }

  ngOnInit(): void {
    interval(500)
    .pipe(takeWhile(() => true))
    .subscribe(() => {
      var buffer = this.uiService.getTextBuffer();
      if(buffer.length > 0 && this.complete) {
        //this.currentText = [...this.currentText, ...buffer];
        buffer.forEach(element => {
          this.pushText(element);
        });
        this.uiService.cleanTextBuffer();
      }
    });
  }

  pushText(text: string) {
    this.complete = false;
    if (this.needsCleanup) {
      this.currentText = [];
      this.needsCleanup = false;
    }
    this.uiService.setViewportEnabling(false);
    this.currentText = [...this.currentText, text];
  }

  cleanBuffer() {
    this.needsCleanup = true;
  }

  enableViewport() {
    this.uiService.setViewportEnabling(true);
  }

}
