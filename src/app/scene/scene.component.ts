import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Run } from '../model/Run';
import { RunState } from '../model/RunState';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit {

  @Input() run: Run;
  @Output() pushTextEvent = new EventEmitter<string>();
  
  constructor() {
    this.run = new Run();
   }

  ngOnInit(): void {
  }

  update(updatedRun: Run) {
    this.run = updatedRun;
  }

  explore() {
    console.log("prova");
    this.run.state = RunState.Location;
    this.pushTextEvent.emit("prova");
  }

}
