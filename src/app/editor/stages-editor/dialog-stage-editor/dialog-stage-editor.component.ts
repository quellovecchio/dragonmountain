import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Stage } from 'src/app/model/Stage';
import { Location } from 'src/app/model/Location';
import { EditorService } from 'src/app/services/editor.service';

@Component({
  selector: 'app-dialog-stage-editor',
  templateUrl: './dialog-stage-editor.component.html',
  styleUrls: ['./dialog-stage-editor.component.scss']
})
export class DialogStageEditorComponent implements OnInit {

  stage: Stage;
  currentLocations: Location[]  = [];
  selectedLocation?: Location = undefined;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Stage, private editorService: EditorService) {
    this.stage = data;
    this.currentLocations = this.editorService.getCurrentLocations();
  }

  ngOnInit(): void {
  }

  addLocation(): void {
      this.stage.locations.push(this.selectedLocation!);
      this.selectedLocation = undefined;
  }

  removeLocation(index: number): void {
      this.stage.locations.splice(index, 1);
      // Trigger change detection
      this.stage.locations = [...this.stage.locations ];
  }

}
