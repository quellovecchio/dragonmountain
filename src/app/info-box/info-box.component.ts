import { Component, Input } from '@angular/core';
import { Run } from '../model/Run';

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
    return Object.keys(this.run.party).length <= 0;
  }

}
