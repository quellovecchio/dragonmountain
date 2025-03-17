import { OnInit, Component } from '@angular/core';
import { interval, switchMap, takeWhile } from 'rxjs';
import { UiService } from '../ui.service';
import { DataService } from 'src/app/data.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { MusicService } from 'src/app/services/music.service';

@Component({
  selector: 'app-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ top: '120%', opacity: 0}),
          animate('500ms', style({ top: '62%', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ top: '62%', opacity: 1}),
          animate('1500ms', style({ top: '120%', opacity: 0 }))
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

  constructor(private uiService: UiService, public dataService: DataService, private musicService: MusicService) { }

  ngOnInit(): void {
    // TODO change 500 to game speed or something like that
    interval(500)
    .pipe(takeWhile(() => true))
    .subscribe(() => {
      var buffer = this.uiService.getTextBuffer();
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
    // talk effect TODO
    /*interval(800)
    .pipe(
      takeWhile(() => true),
      switchMap(() => interval(Math.random() * 600))
    )
    .subscribe(() => {
      if(!this.complete)
        this.musicService.playSound('voices/fx_17b', 0.4);
    });*/
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
