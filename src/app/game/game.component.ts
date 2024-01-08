import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Constants } from 'src/assets/constants';
import { Class } from '../model/Actors/Class';
import { Run } from '../model/Run';
import { Location } from '../model/Location';
import { RunState } from '../model/RunState';
import { Settings } from '../model/Settings';
import { Skill } from '../model/Skill';
import { RunService } from '../services/run.service';
import { ViewportComponent } from './viewport/viewport.component';
import packageJson from '../../../package.json';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  public version: string = packageJson.version;

  public innerWidth: any;
  public scaledMode = false;

  public settings: Settings = new Settings();

  @ViewChild(ViewportComponent)
  viewport: ViewportComponent;

  loadedSavedData: boolean = false;
  run: Run = new Run();
  loadingRun: Run = new Run();

  startingLocations: Location[] = [];

  constructor(viewport: ViewportComponent, private http: HttpClient, private runService: RunService) {
    this.viewport = viewport;
    this.generateRun().then((newRun) => {
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

  generateRun(): Promise<Run> {
    console.log("generateRun() - start");
    return new Promise((resolve, reject) => {
      this.http.get<{classes: Class[], skills: Skill[], bossfight: Location, locations: Location[]}>('./assets/data/db_locations.json').subscribe({
        next: (data) => {
          this.startingLocations = data.locations;
          console.log("generateRun() - all locations:");
          console.log(this.startingLocations);
          let newRun = new Run();
          newRun.stage.locations = data.locations;
          newRun.stage.bossLocation = data.bossfight;
          this.runService.setSkills(data.skills);
          this.runService.setClasses(data.classes);
          newRun.party[0].class = this.runService.classes[0];
          this.runService.setRun(newRun);
          newRun.stage.currentLocations = this.runService.getRefreshedLocations();
          console.log("generateRun() - extracted locations:");
          console.log(newRun.stage.currentLocations);
          console.log("generateRun() - end");
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
    this.run.state = RunState.Intro;
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
