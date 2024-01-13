import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Stage } from 'src/app/model/Stage';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-dialog-stage-editor',
  templateUrl: './dialog-stage-editor.component.html',
  styleUrls: ['./dialog-stage-editor.component.scss']
})
export class DialogStageEditorComponent implements OnInit {

  stage: Stage;
  isEquip = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Stage, private fileService: FileService) {
    this.stage = data;
  }

  ngOnInit(): void {
  }

}
