import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Stage } from 'src/app/model/Stage';
import { DialogStageEditorComponent } from './dialog-stage-editor/dialog-stage-editor.component';

@Component({
  selector: 'app-stages-editor',
  templateUrl: './stages-editor.component.html',
  styleUrls: ['./stages-editor.component.scss']
})
export class StagesEditorComponent implements OnInit {

  savedStages: Stage[] = [];

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  addNewStage() { 
    this.savedStages.push(new Stage());
  }

  openStageEditorDialog(stage: Stage) {
    this.dialog.open(DialogStageEditorComponent, {
      height: '700px',
      width: '600px',
      data: stage,
      panelClass: ['gothic-dialog', 'pixelated-border'],
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms'
    })
  }

}
