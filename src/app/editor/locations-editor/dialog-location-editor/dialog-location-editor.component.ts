import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Actor } from 'src/app/model/Actors/Actor';
import { Location } from 'src/app/model/Location';
import { EditorService } from 'src/app/services/editor.service';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-dialog-location-editor',
  templateUrl: './dialog-location-editor.component.html',
  styleUrls: ['./dialog-location-editor.component.scss']
})
export class DialogLocationEditorComponent implements OnInit {

  images = this.fileService.getAllLocationsImagesFilePaths();
  currentActors = this.editorService.getCurrentActors();
  selectedNpc?: Actor = undefined;

  location: Location;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Location, private fileService: FileService, private editorService: EditorService) {
    this.location = data;
  }

  ngOnInit(): void {
  }

  addActorToLocation() {
    if (this.selectedNpc) {
      console.log(`added actor ${this.selectedNpc.id} - ${this.selectedNpc.name}`);
      this.location.actors.push(this.selectedNpc);
    }
  }

  removeActorFromLocation(index: number) {
    this.location.actors = this.location.actors.splice(index, 1);
  }

}