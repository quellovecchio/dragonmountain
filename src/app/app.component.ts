import { Component, ViewChild } from '@angular/core';
import { Run } from './model/Run';
import { Location } from './model/Location';
import { ViewportComponent } from './game/viewport/viewport.component';
import { RunState } from './model/RunState';
import { HttpClient } from '@angular/common/http';
import {MatSliderModule} from '@angular/material/slider';

import packageJson from '../../package.json';
import { Constants } from 'src/assets/constants';
import { RunService } from './services/run.service';
import { Settings } from './model/Settings';
import { Class } from './model/Actors/Class';
import { Skill } from './model/Skill';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dragon-mountain';

  constructor() {
  }

  ngOnInit() {
  }
}

