import { Component, ViewChild } from '@angular/core';
import { InfoBoxComponent } from './info-box/info-box.component';
import { Character } from './model/Character';
import { Run } from './model/Run';
import { Stats } from './model/Stats';
import { SceneComponent } from './scene/scene.component';
import { TextAreaComponent } from './text-area/text-area.component';
import { ViewportComponent } from './viewport/viewport.component';
import { Time } from "@angular/common";
import { Stage } from './model/Stage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dragon-mountain';

  @ViewChild(ViewportComponent)
  viewport: ViewportComponent;

  run: Run;

  constructor(viewport: ViewportComponent) {
    this.viewport = viewport;
    this.run = this.generateTestRun();
    this.viewport.refreshInfoBox(this.run);
  }

  ngOnInit() {
  }

  generateTestRun(): Run {
    console.log("generateTestRun() - start");
    this.viewport.pushText("Generating run...");
    let newRun = new Run();
    this.viewport.pushText("Run loaded.");
    console.log("generateTestRun() - end");
    return newRun;
  }
}

