import { Component, OnInit } from '@angular/core';
import { Location } from 'src/app/model/Location';
import { DialogLocationEditorComponent } from './dialog-location-editor/dialog-location-editor.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-locations-editor',
  templateUrl: './locations-editor.component.html',
  styleUrls: ['./locations-editor.component.scss']
})
export class LocationsEditorComponent implements OnInit {

  savedLocations: Location[] = [];

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
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
