import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Run } from '../../model/Run';

@Component({
  selector: 'app-diy',
  templateUrl: './diy.component.html',
  styleUrls: ['./diy.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiyComponent implements OnInit {

  loadedRun = new Run();

  constructor() { }

  ngOnInit(): void {
  }

}
