import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Actor } from 'src/app/model/Actors/Actor';
import { Location } from 'src/app/model/Location';
import { EditorService } from 'src/app/services/editor.service';
import { FileService } from 'src/app/services/file.service';
import { DiyBinderComponent } from '../../../diy-binder/diy-binder.component';

@Component({
  selector: 'app-dialog-location-editor',
  templateUrl: './dialog-location-editor.component.html',
  styleUrls: ['./dialog-location-editor.component.scss']
})
export class DialogLocationEditorComponent implements OnInit {

  images = this.fileService.getAllLocationsImagesFilePaths();
  currentActors: Actor[]  = [];
  selectedActor?: Actor = undefined;

  location: Location;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Location, private fileService: FileService, private editorService: EditorService) {
    this.location = data;
    this.currentActors = this.editorService.getCurrentActors();
  }

  ngOnInit(): void {
  }

  addActorToLocation() {
    if (this.selectedActor) {
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

}