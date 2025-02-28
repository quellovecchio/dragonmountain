import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Constants } from 'src/assets/constants';
import { Class } from '../model/Actors/Class';
import { Run } from '../model/Run';
import { RunState } from '../model/RunState';
import { Skill } from '../model/Skill';
import { RunService } from '../services/run.service';
import { Item } from '../model/items/Item';
import { StageDto } from '../model/StageDto';
import { ActorDto } from '../model/Actors/ActorDto';
import { LocationDto } from '../model/LocationDto';
import { STARTING_STATS } from '../editor/diy/diy.component'
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';
import { DataService } from '../data.service';
import { UiService } from './ui-layer/ui.service';
import { interval } from 'rxjs';
import { MusicService } from '../services/music.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  animations: [
        trigger(
          'introAnimationMain',
          [
            transition(
              ':enter',
              [
                style({ height: 0, top: '1900%' }),
                animate('13s ease-out',
                  style({ height: '76%', top: '25%' }))
              ]
            )
          ]
        ),
        trigger(
          'introAnimationClouds2',
          [
            transition(
              ':enter',
              [
                style({ top: 0, backgroundPosition: '-100%, 0', height: '900%' }),
                animate('13s ease-out',
                  style({ top: '50%', backgroundPosition: '0, 0', height: '32%' }))
              ]
            )
          ]
        ),
        trigger(
          'introAnimationClouds1',
          [
            transition(
              ':enter',
              [
                style({ top: 0, backgroundPosition: '-900%, 0', height: '400%' }),
                animate('13s ease-out',
                  style({ top: '50%', backgroundPosition: '0, 0', height: '32%' }))
              ]
            )
          ]
        ),
        trigger(
          'introAnimationDragon',
          [
            transition(
              ':enter',
              [
                style({top: '-50%', height: '600%', width: '400%'   }),
                animate('13s ease-out',
                  style({top: '43%', height: '19%', width: '10%' }))
              ]
            )
          ]
        ),
        trigger(
          'introAnimationLogo',
          [
            transition(
              ':enter',
              [
                style({top: '-50%'  }),
                animate('8s ease-out',
                  style({top: '15%' }))
              ]
            )
          ]
        ),
  ]
})
export class GameComponent implements OnInit {

  public isIntro: boolean = true;
  public introSequencePlaying: boolean = false;
  public introSequenceFinished: boolean = false;

  public innerWidth: any;

  selectedItem?: Item = undefined;

  loadedSavedData: boolean = false;
  run: Run = new Run(new PlayingCharacter(STARTING_STATS));

  // image following cursor when an item is selected
  @ViewChild('followCursorImg', { static: false }) followCursorImg!: ElementRef;

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.uiService.getSelectedItem()) {
      this.selectedItem = this.uiService.getSelectedItem();
      if (this.followCursorImg) {
        const imgElement = this.followCursorImg.nativeElement;

        const containerRect = imgElement.parentElement.getBoundingClientRect();

        const mouseX = event.clientX - containerRect.left - 100;
        const mouseY = event.clientY - containerRect.top - 100;

        const offsetX = mouseX;
        const offsetY = mouseY;

        imgElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
    }
  }

  constructor(private http: HttpClient, private runService: RunService, private dataService: DataService, public uiService: UiService, private musicService: MusicService) {
  }

  play() {
    // press any key to start state - initial state -> play intro sequence
    if(this.isIntro && !this.introSequencePlaying) {
      this.musicService.loopSong("title-theme");
      this.introSequencePlaying = true;
      setInterval(() => {
        this.introSequenceFinished = true;
      }, 15000);
    }
    // intro sequence playing -> skip intro
    if(this.isIntro && this.introSequencePlaying) {
      // TODO: skip intro
    }
    // intro finished -> new game
    if(this.isIntro && this.introSequenceFinished) {
      this.startGame();
    }
  }

  startGame() {
    this.generateRun().then((newRun) => {
      console.log(newRun);
      this.run = newRun;
      this.isIntro = false;
      if (!this.loadedSavedData) {
        this.greetPlayer();
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  ngOnInit() {
    this.selectedItem = this.uiService.getSelectedItem();
    //alert(Constants.TECH_DEMO_INTRO);
    //alert(Constants.TECH_DEMO_HINT);
  }

  generateRun(): Promise<Run> {
    console.log("generateRun() - start");
    return new Promise((resolve, reject) => {
      this.http.get<{ actors: ActorDto[], items: Item[], classes: Class[], skills: Skill[], locations: LocationDto[], lastStage: StageDto, stages: StageDto[] }>('./assets/data/new_db.json').subscribe({
        next: (data) => {
          let newRun = new Run(new PlayingCharacter(STARTING_STATS));
          this.dataService.setItems(data.items);
          this.dataService.setActors(data.actors);
          this.dataService.setSkills(data.skills);
          this.dataService.setClasses(data.classes);
          this.dataService.setLocations(data.locations);
          // TODO update with chosen random stage;
          newRun.stage.name = data.stages[0].name;
          newRun.stage.locations = this.dataService.getLocationsById(data.stages[0].locations);
          newRun.stage.questlines = this.dataService.getLocationsById(data.stages[0].questlines);
          newRun.stage.bossLocation = this.dataService.getLocationById(data.stages[0].bossLocation);
          newRun.party[0].class = this.dataService.classes[0];
          this.runService.setRun(newRun);
          newRun.stage.questlines.forEach((questlineLocation) => {
            if (questlineLocation)
              newRun.stage.currentLocations.push(questlineLocation);
          });
          console.log("generateRun() - extracted locations:");
          console.log(newRun.stage.currentLocations);
          console.log("generateRun() - end");
          resolve(newRun);
        },
        error: (error) => {
          console.log(error);
          let newRun = new Run(new PlayingCharacter(STARTING_STATS));
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
      this.uiService.setViewportEnabling(true);
    }, 14000 / Constants.TEXT_SPEED);
    this.uiService.pushText("Welcome back to Dragon Mountain, traveler!");
    this.uiService.pushText("The first Stage of your journey is " + that.run.stage.name + "...");
    this.uiService.pushText("And it's full of Locations you can Explore!");
    this.uiService.pushText("What is our first destination?");
  }

  getBackgroundImage() {
    if (this.runService.getRun().state == RunState.Exploration)
      return this.runService.getRun().stage.backgroundPath;
    if (this.runService.getRun().state == RunState.Fight || this.runService.getRun().state == RunState.Location)
      return this.runService.getRun().currentLocation?.backgroundPath;
    return "/assets/images/splash_art.png";
  }

}
