import { Component, OnInit } from '@angular/core';
import { Run } from '../model/Run';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss']
})
export class InfoBoxComponent implements OnInit {

  playerName: string = "";
  level: number = 0;
  stageName: string = "";
  time: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  update(updatedRun: Run) {
    this.playerName = updatedRun.player.name;
    this.level = updatedRun.level;
    this.stageName = updatedRun.stage.name;
    this.time = updatedRun.time;
  }

}
