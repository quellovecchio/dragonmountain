import { Component, OnInit, ViewChild } from '@angular/core';
import { InfoBoxComponent } from '../info-box/info-box.component';
import { SceneComponent } from '../scene/scene.component';
import { TextAreaComponent } from '../text-area/text-area.component';

@Component({
  selector: 'app-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss']
})
export class ViewportComponent implements OnInit {

  @ViewChild(InfoBoxComponent)
  infoBox: InfoBoxComponent;

  @ViewChild(SceneComponent)
  scene: SceneComponent;

  @ViewChild(TextAreaComponent)
  textArea: TextAreaComponent;

  constructor(infoBox: InfoBoxComponent, 
    scene: SceneComponent, 
    textArea: TextAreaComponent) {
    this.infoBox = infoBox;
    this.scene = scene;
    this.textArea = textArea;
  }

  ngOnInit(): void {
  }

}
