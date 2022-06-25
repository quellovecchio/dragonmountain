import { Component, ViewChild } from '@angular/core';
import { Run } from './model/Run';
import { Location } from './model/Location';
import { ViewportComponent } from './viewport/viewport.component';
import { RunState } from './model/RunState';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dragon-mountain';

  @ViewChild(ViewportComponent)
  viewport: ViewportComponent;

  loadedSavedData: boolean = false;
  run: Run;

  constructor(viewport: ViewportComponent) {
    this.viewport = viewport;
    this.run = this.generateTestRun();
    this.viewport.refreshInfoBox(this.run);
    if(!this.loadedSavedData) {
      this.greetPlayer();
    }
  }
  
  generateTestRun(): Run {
    console.log("generateTestRun() - start");
    let newRun = new Run();
    for(var i = 0; i < 5; i++){
      newRun.stage.locations.push(new Location());
    }
    console.log("generateTestRun() - end");
    return newRun;
  }

  
  greetPlayer() {
    var that = this;
    setTimeout(function() { that.viewport.pushText("The first Stage of your journey is " + that.run.stage.name + "...") }, 1000 * that.run.textSpeed);
    setTimeout(function() { that.viewport.pushText("And it's full of Locations you can Explore!") }, 2000 * that.run.textSpeed);
    setTimeout(function() { that.viewport.pushText("What is our first destination?") }, 3000 * that.run.textSpeed);
    setTimeout(function() { that.viewport.refreshScene(that.run); that.run.state = RunState.Exploration }, 4000 * that.run.textSpeed);
  }

}

