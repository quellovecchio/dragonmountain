import { OnInit, Component } from '@angular/core';
import { interval, takeWhile } from 'rxjs';
import { UiService } from '../ui.service';
import { DataService } from 'src/app/data.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ opacity: 0}),
          animate('500ms', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          style({ opacity: 1}),
          animate('500ms', style({ opacity: 0 }))
        ])
      ]
    )
  ]
})
export class TextAreaComponent implements OnInit {

  currentText: string[] = [];
  textBuffer: string[] = this.uiService.getTextBuffer();
  needsCleanup: boolean = false;

  complete: boolean = true;
  visible: boolean = false;

  constructor(private uiService: UiService, public dataService: DataService) { }

  ngOnInit(): void {
    // TODO change 500 to game speed or something like that
    interval(500)
    .pipe(takeWhile(() => true))
    .subscribe(() => {
      var buffer = this.uiService.getTextBuffer();
      console.log(buffer);
      if(buffer.length > 0) {
        buffer.forEach(element => {
          this.visible = true;
          this.uiService.setTextAreaVisibility(true);
          this.pushText(element);
        });
        this.uiService.cleanTextBuffer();
      }
      if(this.complete) {
        this.uiService.setTextAreaVisibility(false);
        this.visible = false;
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
