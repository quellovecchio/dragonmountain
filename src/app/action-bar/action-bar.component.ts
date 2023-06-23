import { Component, Input, OnInit } from '@angular/core';
import { Run } from '../model/Run';

@Component({
  selector: 'app-action-bar',
  templateUrl: './action-bar.component.html',
  styleUrls: ['./action-bar.component.scss']
})
export class ActionBarComponent implements OnInit {

  @Input() run: Run = new Run();

  constructor() { }

  ngOnInit(): void {
  }

}
