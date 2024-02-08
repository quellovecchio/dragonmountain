import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { Location } from 'src/app/model/Location';
import { DialogLocationEditorComponent } from './dialog-location-editor/dialog-location-editor.component';
import { MatDialog } from '@angular/material/dialog';
import { EditorService } from 'src/app/services/editor.service';

@Component({
  selector: 'app-locations-editor',
  templateUrl: './locations-editor.component.html',
  styleUrls: ['./locations-editor.component.scss']
})
export class LocationsEditorComponent implements OnInit, AfterViewChecked {

  savedLocations: Location[] = [];

  constructor(private dialog: MatDialog, private editorService: EditorService) { }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    if(this.editorService.getCurrentLocations() !== this.savedLocations) {
      this.savedLocations = this.editorService.getCurrentLocations();
      this.savedLocations = [...this.savedLocations]
    }
  }

  save(): void {
    this.editorService.saveCurrentLocations(this.savedLocations);
  }

  addNewLocation() { 
    this.savedLocations.push(new Location());
  }

  openLocationEditorDialog(location: Location) {
    this.dialog.open(DialogLocationEditorComponent, {
      height: '700px',
      width: '600px',
      data: location,
      panelClass: ['gothic-dialog', 'pixelated-border'],
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms'
    })
  }

}
