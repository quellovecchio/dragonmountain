import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Character } from 'src/app/model/Actors/Character';
import { DialogNpcEditorComponent } from './dialog-npc-editor/dialog-npc-editor.component';
import { EditorService } from 'src/app/services/editor.service';
import { Actor } from 'src/app/model/Actors/Actor';

@Component({
  selector: 'app-npcs-editor',
  templateUrl: './npcs-editor.component.html',
  styleUrls: ['./npcs-editor.component.scss']
})
export class NpcsEditorComponent implements OnInit, AfterViewChecked {

  savedNpcs: Actor[] = [];

  constructor(private dialog: MatDialog, private editorService: EditorService) { }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    if(this.editorService.getCurrentActors() !== this.savedNpcs) {
      this.savedNpcs = this.editorService.getCurrentActors();
      this.savedNpcs = [...this.savedNpcs]
    }
  }

  save(): void {
    this.editorService.saveCurrentActors(this.savedNpcs);
  }

  addNewNpc() { 
    this.savedNpcs.push(new Actor());
  }

  openNpcEditorDialog(npc: Actor) {
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
