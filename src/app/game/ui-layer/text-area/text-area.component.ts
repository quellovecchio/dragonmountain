import { OnInit, Component } from '@angular/core';
import { interval, takeWhile } from 'rxjs';
import { UiService } from '../ui.service';
import { DataService } from 'src/app/data.service';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss']
})
export class TextAreaComponent implements OnInit {

  currentText: string[] = [];
  textBuffer: string[] = this.uiService.getTextBuffer();
  needsCleanup: boolean = false;

  complete: boolean = true;

  constructor(private uiService: UiService, public dataService: DataService) { }

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
