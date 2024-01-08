import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Class } from 'src/app/model/Actors/Class';
import { DialogClassEditorComponent } from './dialog-class-editor/dialog-class-editor.component';

@Component({
  selector: 'app-classes-editor',
  templateUrl: './classes-editor.component.html',
  styleUrls: ['./classes-editor.component.scss']
})
export class ClassesEditorComponent implements OnInit {

  savedClasses: Class[] = [];

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  addNewClass() { 
    this.savedClasses.push(new Class());
  }

  openClassEditorDialog(classParam: Class) {
    this.dialog.open(DialogClassEditorComponent, {
      height: '700px',
      width: '600px',
      data: classParam,
      panelClass: ['gothic-dialog', 'pixelated-border'],
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms'
    })
  }

}
