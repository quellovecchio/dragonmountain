import { OnInit, Component, ElementRef, ViewChild, ChangeDetectorRef, Input } from '@angular/core';
import { ViewportService } from '../viewport/viewport.service';
import { interval, isEmpty, startWith, switchMap, takeWhile } from 'rxjs';

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

  constructor(private viewportService: ViewportService) { }

  ngOnInit(): void {
    interval(500)
    .pipe(takeWhile(() => true))
    .subscribe(() => {
      var buffer = this.viewportService.getTextBuffer();
      if(buffer.length > 0 && this.complete) {
        //this.currentText = [...this.currentText, ...buffer];
        buffer.forEach(element => {
          this.pushText(element);
        });
        this.viewportService.cleanTextBuffer();
      }
    });
  }

  pushText(text: string) {
    this.complete = false;
    if (this.needsCleanup) {
      this.currentText = [];
      this.needsCleanup = false;
    }
    this.viewportService.setViewportEnabling(false);
    this.currentText = [...this.currentText, text];
  }

  cleanBuffer() {
    this.needsCleanup = true;
  }

  enableViewport() {
    this.viewportService.setViewportEnabling(true);
  }

}
