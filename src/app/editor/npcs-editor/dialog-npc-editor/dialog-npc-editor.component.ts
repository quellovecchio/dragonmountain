import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Character } from 'src/app/model/Actors/Character';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-dialog-npc-editor',
  templateUrl: './dialog-npc-editor.component.html',
  styleUrls: ['./dialog-npc-editor.component.scss']
})
export class DialogNpcEditorComponent implements OnInit {

  npc: Character;
  isEquip = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Character, private fileService: FileService) {
    this.npc = data;
  }

  ngOnInit(): void {
  }

}