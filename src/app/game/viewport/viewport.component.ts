import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { InfoBoxComponent } from '../info-box/info-box.component';
import { Run } from '../../model/Run';
import { SceneComponent } from '../scene/scene.component';
import { TextAreaComponent } from '../text-area/text-area.component';
import { ActionBarComponent } from '../action-bar/action-bar.component';
import { Item } from '../../model/items/Item';
import { Settings } from '../../model/Settings';
import { Actor } from '../../model/Actors/Actor';
import { Equip } from '../../model/items/Equip';
import { ViewportService } from './viewport.service';
import { Character } from '../../model/Actors/Character';
import { STARTING_STATS } from 'src/app/editor/diy/diy.component';
import { PlayingCharacter } from 'src/app/model/Actors/PlayingCharacter';
import { RunState } from 'src/app/model/RunState';
import { ItemService } from 'src/app/services/item.service';
import { RunService } from 'src/app/services/run.service';

@Component({
  selector: 'app-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss']
})
export class ViewportComponent implements OnInit {

  @Input() run: Run = new Run(new PlayingCharacter(STARTING_STATS));
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
      if (this.followCursorImg) {
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
    actionBar: ActionBarComponent,
    public viewportService: ViewportService,
    public itemService: ItemService,
    public runService: RunService) {
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
  }

  selectItem(item: Item) {
    this.selectedItem = item;
  }

  interactionEnd() {
    this.selectedItem = undefined;
  }

  refreshLocations() {
    this.run.experience = this.run.experience - 1;
    this.scene.refreshLocations(false);
    this.viewportService.pushText("The party goes in exploration...");
    this.viewportService.pushText("And they found three new areas!");
  }

  addExp() {
    this.run.experience++;
  }

  moveToBossfight() {
    if (this.run.stage.bossfightLocked) {
      console.log("first time unlocking bossfight");
      this.run.stage.bossfightLocked = false;
      this.run.experience = this.run.experience - 4 * this.run.level;
    }
    this.run.showBossfightLocation = !this.run.showBossfightLocation;
    console.log(this.run.showBossfightLocation);
    this.viewportService.pushText("I'm impressed you feel ready for the bossfight, but be careful!");
    this.viewportService.pushText("The party moved to the boss fight location, " + this.run.stage.bossLocation.name + "!");
  }

  equipItem(equipData: { equipSlot: number, actor: Actor }) {
    if (this.selectedItem) {
      let newEquip = (this.selectedItem as Equip);
      if (newEquip.attack || newEquip.defense || newEquip.buffs.length > 0) {
        // update character in the party
        var characterIndex = this.run.party.findIndex(el => { return el == equipData.actor });
        if (this.run.party[characterIndex].equipment.length < 3) {
          this.run.party[characterIndex].equipment.push(newEquip);
          this.textArea.pushText(newEquip.name + " is equipped by " + equipData.actor.name);
          this.selectedItem = undefined;
        } else {
          let oldEquip = this.run.party[characterIndex].equipment[equipData.equipSlot];
          this.run.party[characterIndex].equipment[equipData.equipSlot] = newEquip;
          this.run.inventory.items.push(oldEquip);
          this.textArea.pushText(newEquip.name + " is equipped by " + equipData.actor.name);
          this.selectedItem = undefined;
        }
      } else {
        this.textArea.pushText("The selected item is not an equipment");
        this.selectedItem = undefined;
      }

    } else {
      this.textArea.pushText("You have to select an item from inventory to equip it.");
      this.selectedItem = undefined;
    }
  }

  interact(interactionData: any) {
    this.selectedItem = undefined;
    if(this.itemService.isItem(interactionData.action))
      this.runService.removeItemFromInventory(interactionData.action);
    this.scene.interact({character: interactionData.actor, action: interactionData.action})
  }

  getBackgroundImage() {
    if (this.run.state == RunState.Exploration)
      return this.run.stage.backgroundPath;
    if (this.run.state == RunState.Fight || this.run.state == RunState.Location)
      return this.run.currentLocation?.backgroundPath;
    return "/assets/images/splash_art.png";
  }

}
