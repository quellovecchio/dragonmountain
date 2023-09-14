import { Component, ViewChild } from '@angular/core';
import { Run } from './model/Run';
import { Location } from './model/Location';
import { ViewportComponent } from './viewport/viewport.component';
import { RunState } from './model/RunState';
import { HttpClient } from '@angular/common/http';

import packageJson from '../../package.json';
import { Constants } from 'src/assets/constants';
import { RunService } from './run.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public version: string = packageJson.version;
  title = 'dragon-mountain';

  public innerWidth: any;
  public scaledMode = false;

  @ViewChild(ViewportComponent)
  viewport: ViewportComponent;

  loadedSavedData: boolean = false;
  run: Run = new Run();
  loadingRun: Run = new Run();

  startingLocations: Location[] = [];

  constructor(viewport: ViewportComponent, private http: HttpClient, private runService: RunService) {
    this.viewport = viewport;
    this.generateTestRun().then((newRun) => {
      console.log(newRun);
      this.run = newRun;
      if (!this.loadedSavedData) {
        this.greetPlayer();
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  ngOnInit() {
    alert(Constants.TECH_DEMO_INTRO);
    alert(Constants.TECH_DEMO_HINT);
    this.innerWidth = window.innerWidth;
    if(this.innerWidth < 590)
      this.scaledMode = true;
  }

  generateTestRun(): Promise<Run> {
    console.log("generateTestRun() - start");
    return new Promise((resolve, reject) => {
      this.http.get<{bossfight: Location, locations: Location[]}>('./assets/data/db_locations.json').subscribe({
        next: (data) => {
          this.startingLocations = data.locations;
          console.log("generateTestRun() - all locations:");
          console.log(this.startingLocations);
          let newRun = new Run();
          newRun.stage.locations = data.locations;
          newRun.stage.bossLocation = data.bossfight;
          // TODO: extract the stage
          // extract the first three random locations from stage
          this.runService.setRun(newRun);
          newRun.stage.currentLocations = this.runService.getRefreshedLocations();
          console.log("generateTestRun() - extracted locations:");
          console.log(newRun.stage.currentLocations);
          console.log("generateTestRun() - end");
          resolve(newRun);
        },
        error: (error) => {
          console.log(error);
          let newRun = new Run();
          reject(newRun);
        }
      });
    });
  }


  greetPlayer() {
    var that = this;
    setTimeout(() => {
      that.run.state = RunState.Exploration;
    }, 7000 / Constants.TEXT_SPEED);
    setTimeout(() => {
      that.viewport.sceneIsReady(that.run);
    }, 14000 / Constants.TEXT_SPEED);
    that.viewport.pushText("Welcome back to Dragon Mountain, traveler!");
    that.viewport.pushText("The first Stage of your journey is " + that.run.stage.name + "...");
    that.viewport.pushText("And it's full of Locations you can Explore!");
    that.viewport.pushText("What is our first destination?");
  }

}

