import { Component, Input } from '@angular/core';
import { Run } from '../model/Run';
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss']
})
export class InfoBoxComponent {

  @Input() run: Run;

  constructor() { 
    this.run = new Run();
  }

  update(updatedRun: Run) {
    this.run = updatedRun;
  }

  gameOver() {
    // game is over if every member of the party is dead 
    return this.run.party.every((item: PlayingCharacter) => item.dead);
  }

}
