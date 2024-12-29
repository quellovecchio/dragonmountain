import { Component, Input } from '@angular/core';
import { PlayingCharacter } from '../../../../model/Actors/PlayingCharacter';
import { RunService } from 'src/app/services/run.service';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss']
})
export class InfoBoxComponent {

  constructor(public runService: RunService) {
  }

  gameOver() {
    // game is over if every member of the party is dead 
    return this.runService.getRun().party.every((item: PlayingCharacter) => item.dead);
  }

}
