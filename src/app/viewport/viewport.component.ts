import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { InfoBoxComponent } from '../info-box/info-box.component';
import { Run } from '../model/Run';
import { SceneComponent } from '../scene/scene.component';
import { TextAreaComponent } from '../text-area/text-area.component';
import { PlayingCharacter } from '../model/Actors/PlayingCharacter';
import { ActionBarComponent } from '../action-bar/action-bar.component';
import { Item } from '../model/items/Item';
import { Settings } from '../model/Settings';

@Component({
  selector: 'app-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss']
})
export class ViewportComponent implements OnInit {

  @Input() run: Run = new Run();
  @Input() settings!: Settings;

  @ViewChild(InfoBoxComponent)
  infoBox: InfoBoxComponent;

  @ViewChild(SceneComponent)
  scene: SceneComponent;

  @ViewChild(ActionBarComponent)
  actionBar: ActionBarComponent;

  @ViewChild(TextAreaComponent)
  textArea: TextAreaComponent;

  selectedItem?: Item = undefined;

  // image following cursor when an item is selected
  @ViewChild('followCursorImg', { static: false }) followCursorImg!: ElementRef;

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.selectedItem) {
      if(this.followCursorImg) {
        const imgElement = this.followCursorImg.nativeElement;

        const containerRect = imgElement.parentElement.getBoundingClientRect();

        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;

        const offsetX = mouseX + 50;
        const offsetY = mouseY + 50;

        imgElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
    }
  }

  constructor(infoBox: InfoBoxComponent,
    scene: SceneComponent,
    textArea: TextAreaComponent,
    actionBar: ActionBarComponent) {
    this.infoBox = infoBox;
    this.scene = scene;
    this.textArea = textArea;
    this.actionBar = actionBar;
  }

  ngOnInit(): void {
  }

  pushText(text: string) {
    this.textArea.pushText(text);
  }

  sceneIsReady(run: Run) {
    this.scene.ready = true;
    this.scene.update(run)
  }

  selectItem(item: Item) {
    this.selectedItem = item;
  }

  interactionEnd() {
    this.selectedItem = undefined;
  }

  refreshLocations() {
    this.run.experience = this.run.experience -1;
    this.scene.refreshLocations();
  }

  addExp() {
    this.run.experience ++;
  }

  moveToBossfight() {
    if(this.run.stage.bossfightLocked) {
      console.log("first time unlocking bossfight");
      this.run.stage.bossfightLocked = false;
      this.run.experience = this.run.experience - 4 * this.run.level;
    }
    this.run.showBossfightLocation = !this.run.showBossfightLocation;
    console.log(this.run.showBossfightLocation);
  }

}
