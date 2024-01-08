import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog-location-editor',
  templateUrl: './dialog-location-editor.component.html',
  styleUrls: ['./dialog-location-editor.component.scss']
})
export class DialogLocationEditorComponent implements OnInit {

  location: Location;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Character, private fileService: FileService) {
    this.npc = data;
  }

  ngOnInit(): void {
  }

}