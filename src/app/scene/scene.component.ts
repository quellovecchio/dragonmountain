import { Component, Input, OnInit } from '@angular/core';
import { Run } from '../model/Run';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit {

  @Input() run: Run;

  displayedColumns: string[] = ['name'];

  constructor() {
    this.run = new Run();
   }

  ngOnInit(): void {
  }

  update(updatedRun: Run) {
    this.run = updatedRun;
  }

}
