import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Character } from 'src/app/model/Actors/Character';
import { DialogNpcEditorComponent } from './dialog-npc-editor/dialog-npc-editor.component';

@Component({
  selector: 'app-npcs-editor',
  templateUrl: './npcs-editor.component.html',
  styleUrls: ['./npcs-editor.component.scss']
})
export class NpcsEditorComponent implements OnInit {

  savedNpcs: Character[] = [];

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  addNewNpc() { 
    this.savedNpcs.push(new Character());
  }

  openNpcEditorDialog(npc: Character) {
    this.dialog.open(DialogNpcEditorComponent, {
      height: '700px',
      width: '600px',
      data: npc,
      panelClass: ['gothic-dialog', 'pixelated-border'],
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms'
    })
  }

}
