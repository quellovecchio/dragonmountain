import { Component, ViewChild } from '@angular/core';
import { Run } from './model/Run';
import { Location } from './model/Location';
import { ViewportComponent } from './viewport/viewport.component';

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
    this.viewport.refreshScene(this.run);
    setInterval(() => {
      this.viewport.pushText(Math.round(Math.random() * 1000).toString());
      this.viewport.refreshScene(this.run);
    }, 600);
  }

  generateTestRun(): Run {
    console.log("generateTestRun() - start");
    this.viewport.pushText("Generating run...");
    let newRun = new Run();
    for(var i = 0; i < 5; i++){
      newRun.stage.locations.push(new Location());
    }
    this.viewport.pushText("Run loaded.");
    console.log("generateTestRun() - end");
    return newRun;
  }
}

