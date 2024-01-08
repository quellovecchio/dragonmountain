import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Class } from 'src/app/model/Actors/Class';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-dialog-class-editor',
  templateUrl: './dialog-class-editor.component.html',
  styleUrls: ['./dialog-class-editor.component.scss']
})
export class DialogClassEditorComponent implements OnInit {

  classParam: Class;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Class, private fileService: FileService) {
    this.classParam = data;
  }

  ngOnInit(): void {
  }

}
