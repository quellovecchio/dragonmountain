import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Constants } from 'src/assets/constants';
import { Class } from '../model/Actors/Class';
import { Run } from '../model/Run';
import { RunState } from '../model/RunState';
import { Settings } from '../model/Settings';
import { Skill } from '../model/Skill';
import { RunService } from '../services/run.service';
import { ViewportComponent } from './viewport/viewport.component';
import packageJson from '../../../package.json';
import { Item } from '../model/items/Item';
import { StageDto } from '../model/StageDto';
import { ActorDto } from '../model/Actors/ActorDto';
import { LocationDto } from '../model/LocationDto';

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
    //alert(Constants.TECH_DEMO_INTRO);
    //alert(Constants.TECH_DEMO_HINT);
    this.innerWidth = window.innerWidth;
    if(this.innerWidth < 590)
      this.scaledMode = true;
  }

  generateRun(): Promise<Run> {
    console.log("generateRun() - start");
    return new Promise((resolve, reject) => {
      this.http.get<{actors: ActorDto[], items: Item[], classes: Class[], skills: Skill[], locations: LocationDto[], lastStage: StageDto, stages: StageDto[]}>('./assets/data/new_db.json').subscribe({
        next: (data) => {
          let newRun = new Run();
          this.runService.setItems(data.items);
          this.runService.setActors(data.actors);
          this.runService.setSkills(data.skills);
          this.runService.setClasses(data.classes);
          this.runService.setLocations(data.locations);
          newRun.stage.locations = this.runService.getLocations(data.stages[0].locations);
          newRun.stage.questlines = this.runService.getQuestlineTree(data.stages[0].questlines);
          newRun.stage.bossLocation = this.runService.getLocationById(data.stages[0].bossLocation);
          newRun.party[0].class = this.runService.classes[0];
          this.runService.setRun(newRun);
          newRun.stage.questlines.forEach((questline) => {
            if(questline)
              newRun.stage.currentLocations.push(questline.root);
          });
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
