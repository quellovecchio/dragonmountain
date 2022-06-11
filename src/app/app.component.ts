import { Component, ViewChild } from '@angular/core';
import { ViewportComponent } from './viewport/viewport.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dragon-mountain';

  @ViewChild(ViewportComponent)
  viewport: ViewportComponent;

  constructor(viewport: ViewportComponent) {
    this.viewport = viewport;
  }
}
