import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Actor } from 'src/app/model/Actors/Actor';
import { Location } from 'src/app/model/Location';
import { EditorService } from 'src/app/services/editor.service';
import { FileService } from 'src/app/services/file.service';
import { DiyBinderComponent } from '../../../diy-binder/diy-binder.component';
import { Character } from 'src/app/model/Actors/Character';
import { Item } from 'src/app/model/items/Item';

@Component({
  selector: 'app-dialog-location-editor',
  templateUrl: './dialog-location-editor.component.html',
  styleUrls: ['./dialog-location-editor.component.scss']
})
export class DialogLocationEditorComponent implements OnInit {

  images = this.fileService.getAllLocationsImagesFilePaths();
  currentActors: Actor[]  = [];
  currentEnemies: Actor[]  = [];
  currentItems: Item[]  = [];
  selectedActor?: Actor = undefined;
  selectedActorFight?: Actor = undefined;
  selectedItem?: Item = undefined;

  location: Location;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Location, private fileService: FileService, private editorService: EditorService) {
    this.location = data;
    this.currentActors = this.editorService.getCurrentActors();
    this.currentItems = this.editorService.getCurrentItems();
    this.currentEnemies = this.editorService.getCurrentEnemies();
  }

  ngOnInit(): void {
  }

  addActorToLocation() {
    if (this.selectedActor && this.location.actors.length < 3) {
      console.log(`added actor ${this.selectedActor.id} - ${this.selectedActor.name}`);
      this.location.actors.push(this.selectedActor);
      this.currentActors = this.currentActors.filter(item => item.id !== this.selectedActor!.id);
      this.selectedActor = undefined;
    }
  }

  removeActorFromLocation(index: number) {
    this.location.actors.splice(index, 1);
    // Trigger change detection
    this.location.actors = [...this.location.actors];
  }

  addActorToFight() {
    if (this.selectedActorFight && this.location.fight.length < 3) {
      console.log(`added actor ${this.selectedActorFight.id} - ${this.selectedActorFight.name}`);
      this.location.fight.push(this.selectedActorFight as Character);
      this.currentEnemies = this.currentEnemies.filter(item => item.id !== this.selectedActorFight!.id);
      this.selectedActorFight = undefined;
    }
  }

  removeActorFromFight(index: number) {
    this.location.fight.splice(index, 1);
    // Trigger change detection
    this.location.fight = [...this.location.fight];
  }

  addItemToLoot() {
    if (this.selectedItem) {
      console.log(`added actor ${this.selectedItem.id} - ${this.selectedItem.name}`);
      this.location.loot.push(this.selectedItem);
      this.currentItems = this.currentItems.filter(item => item.id !== this.selectedItem!.id);
      this.selectedItem = undefined;
    }
  }

  removeItemFromLoot(index: number) {
    this.location.loot.splice(index, 1);
    // Trigger change detection
    this.location.loot = [...this.location.loot];
  }

}